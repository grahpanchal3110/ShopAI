// app/api/ai/chat/route.ts
import { NextRequest } from "next/server";
import { openai } from "@/lib/ai/openai";
import { SYSTEM_PROMPT, CHATBOT_TOOLS, executeTool } from "@/lib/ai/chatbot";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiRateLimiter } from "@/lib/cache/redis";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  // Rate limit per user/IP
  const identifier = clerkId ?? req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await aiRateLimiter.limit(`chat:${identifier}`);
  if (!success) {
    return new Response("Too many requests. Please wait a moment.", {
      status: 429,
    });
  }

  const { messages, sessionId } = await req.json();

  // Get user ID for order lookups
  let userId: string | undefined;
  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    userId = user?.id;
  }

  // Save conversation to DB
  let conversation = await prisma.chatConversation.findUnique({
    where: { sessionId },
  });

  if (!conversation) {
    conversation = await prisma.chatConversation.create({
      data: { sessionId, userId },
    });
  }

  // Stream response using native OpenAI streaming
  const stream = new ReadableStream({
    async start(controller) {
      const encode = (text: string) =>
        controller.enqueue(new TextEncoder().encode(`data: ${text}\n\n`));

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-10), // last 10 messages for context
          ],
          tools: CHATBOT_TOOLS,
          tool_choice: "auto",
          stream: true,
          temperature: 0.7,
          max_tokens: 500,
        });

        let fullContent = "";
        let toolCalls: any[] = [];
        let currentToolCall: any = null;

        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta;

          if (delta?.content) {
            fullContent += delta.content;
            encode(JSON.stringify({ type: "text", content: delta.content }));
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.index !== undefined) {
                if (!toolCalls[tc.index])
                  toolCalls[tc.index] = { id: "", name: "", args: "" };
                if (tc.id) toolCalls[tc.index].id = tc.id;
                if (tc.function?.name)
                  toolCalls[tc.index].name = tc.function.name;
                if (tc.function?.arguments)
                  toolCalls[tc.index].args += tc.function.arguments;
              }
            }
          }

          if (
            chunk.choices[0]?.finish_reason === "tool_calls" &&
            toolCalls.length > 0
          ) {
            // Execute tools
            for (const tc of toolCalls) {
              encode(JSON.stringify({ type: "tool_call", name: tc.name }));
              const args = JSON.parse(tc.args || "{}");
              const result = await executeTool(tc.name, args, userId);
              encode(
                JSON.stringify({ type: "tool_result", name: tc.name, result }),
              );

              // Get AI to process tool result
              const followUp = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages.slice(-8),
                  {
                    role: "assistant",
                    tool_calls: [
                      {
                        id: tc.id,
                        type: "function",
                        function: { name: tc.name, arguments: tc.args },
                      },
                    ],
                  },
                  { role: "tool", tool_call_id: tc.id, content: result },
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 400,
              });

              for await (const followChunk of followUp) {
                const content = followChunk.choices[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  encode(JSON.stringify({ type: "text", content }));
                }
              }
            }
          }
        }

        // Save messages to DB
        if (fullContent) {
          const lastUserMessage = messages[messages.length - 1];
          await prisma.chatMessage.createMany({
            data: [
              {
                conversationId: conversation.id,
                role: "user",
                content: lastUserMessage.content,
              },
              {
                conversationId: conversation.id,
                role: "assistant",
                content: fullContent,
              },
            ],
          });
        }

        encode(JSON.stringify({ type: "done" }));
        controller.close();
      } catch (err: any) {
        encode(JSON.stringify({ type: "error", message: err.message }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
