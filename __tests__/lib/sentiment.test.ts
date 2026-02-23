// __tests__/lib/sentiment.test.ts
import { analyzeSentiment } from "@/lib/ai/sentiment";

// Mock OpenAI
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 0.85,
                  label: "positive",
                  isFlagged: false,
                  reason: null,
                }),
              },
            },
          ],
        }),
      },
    },
  }));
});

describe("Sentiment Analysis", () => {
  it("returns positive sentiment for good review", async () => {
    const result = await analyzeSentiment(
      "This product is absolutely amazing! Best purchase I've made.",
    );
    expect(result.label).toBe("positive");
    expect(result.score).toBeGreaterThan(0);
    expect(result.isFlagged).toBe(false);
  });

  it("score is within -1 to 1 range", async () => {
    const result = await analyzeSentiment("Average product, nothing special.");
    expect(result.score).toBeGreaterThanOrEqual(-1);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
