// __tests__/api/smart-search.test.ts
import { GET } from "@/app/api/ai/smart-search/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "1",
          name: "iPhone 15",
          slug: "iphone-15",
          price: 79999,
          images: [],
        },
      ]),
    },
    searchLog: {
      create: jest.fn(),
    },
  },
}));

describe("GET /api/ai/smart-search", () => {
  it("returns suggestions for query", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/ai/smart-search?q=iphone&suggestions=true",
    );
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("suggestions");
    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it("returns empty for short query", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/ai/smart-search?q=i",
    );
    const res = await GET(req);
    const data = await res.json();

    expect(data.suggestions).toHaveLength(0);
  });
});
