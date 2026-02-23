// jest.setup.ts
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true, userId: "test-clerk-id" }),
  useUser: () => ({ user: { id: "test-clerk-id", firstName: "Test" } }),
  SignInButton: ({ children }: any) => children,
  SignedIn: ({ children }: any) => children,
  SignedOut: () => null,
  UserButton: () => null,
  ClerkProvider: ({ children }: any) => children,
}));

// Mock Redis
jest.mock("@/lib/cache/redis", () => ({
  redis: { get: jest.fn(), set: jest.fn(), setex: jest.fn(), del: jest.fn() },
  getCached: jest.fn((_, fetcher) => fetcher()),
  rateLimiter: { limit: jest.fn().mockResolvedValue({ success: true }) },
  aiRateLimiter: { limit: jest.fn().mockResolvedValue({ success: true }) },
}));
