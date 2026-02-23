// lib/monitoring/analytics.ts
// Track key business events (Vercel Analytics is free)

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("event", { name, ...properties });
  }
}

// Usage:
// trackEvent("purchase", { total: 9999, method: "RAZORPAY" });
// trackEvent("ai_search", { query: "laptop", results: 12 });
// trackEvent("chatbot_open");
