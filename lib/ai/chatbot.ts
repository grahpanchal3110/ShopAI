// lib/ai/chatbot.ts
import { openai as openaiClient } from "./openai";
import { prisma } from "@/lib/db/prisma";
import { semanticSearch } from "./vector-search";

export const SYSTEM_PROMPT = `You are ShopAI's helpful customer support assistant. You help customers with:
- Order tracking and status updates
- Product information and recommendations  
- Return and refund requests
- General shopping questions

Guidelines:
- Be warm, concise, and helpful
- Use the provided tools to fetch real data — never guess order/product details
- If you can't help with something, escalate gracefully
- Format responses with markdown for clarity
- Always verify order ownership before sharing details
- Keep responses under 150 words unless detailed info is needed`;

export const CHATBOT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_order_status",
      description: "Get the status and details of a customer's order",
      parameters: {
        type: "object",
        properties: {
          orderNumber: {
            type: "string",
            description: "The order number or ID provided by the customer",
          },
        },
        required: ["orderNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description: "Search for products based on customer query",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Product search query" },
          limit: { type: "number", description: "Max results (default 3)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_return_policy",
      description: "Get information about the return and refund policy",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "initiate_return",
      description: "Start a return request for a delivered order",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["orderId", "reason"],
      },
    },
  },
];

export async function executeTool(
  toolName: string,
  args: any,
  userId?: string,
): Promise<string> {
  switch (toolName) {
    case "get_order_status": {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            {
              orderNumber: { contains: args.orderNumber, mode: "insensitive" },
            },
            { id: args.orderNumber },
          ],
          ...(userId ? { userId } : {}),
        },
        include: {
          items: { take: 3, select: { name: true, quantity: true } },
          address: { select: { city: true, state: true } },
        },
      });

      if (!order) {
        return JSON.stringify({
          error: "Order not found. Please check the order number.",
        });
      }

      return JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        items: order.items.map((i) => `${i.name} (×${i.quantity})`),
        trackingNumber: order.trackingNumber ?? "Not yet assigned",
        estimatedDelivery: order.estimatedDelivery
          ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN")
          : "Will be updated when shipped",
        deliveryCity: order.address.city,
      });
    }

    case "search_products": {
      const products = await semanticSearch(args.query, args.limit ?? 3);
      if (!products.length)
        return JSON.stringify({ results: [], message: "No products found" });
      return JSON.stringify({
        results: products.map((p: any) => ({
          name: p.name,
          price: `₹${p.price.toLocaleString()}`,
          url: `/products/${p.slug}`,
          inStock: p.isInStock,
        })),
      });
    }

    case "get_return_policy": {
      return JSON.stringify({
        policy: "You can return most items within 7 days of delivery.",
        conditions: [
          "Item must be unused and in original packaging",
          "Electronics must have all accessories",
          "Refund processed in 5–7 business days after receiving the return",
          "COD orders refunded to bank account",
          "Paid orders refunded to original payment method",
        ],
        howToReturn: "Go to Orders → Select Order → Click 'Request Return'",
      });
    }

    case "initiate_return": {
      if (!userId)
        return JSON.stringify({ error: "Please sign in to initiate a return" });

      const order = await prisma.order.findFirst({
        where: { id: args.orderId, userId, status: "DELIVERED" },
      });

      if (!order) {
        return JSON.stringify({
          error: "Order not found or not eligible for return",
        });
      }

      await prisma.returnRequest.create({
        data: { orderId: args.orderId, reason: args.reason, status: "PENDING" },
      });

      await prisma.order.update({
        where: { id: args.orderId },
        data: { status: "RETURN_REQUESTED" },
      });

      return JSON.stringify({
        success: true,
        message:
          "Return request submitted! You'll receive an update within 24 hours.",
      });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}
