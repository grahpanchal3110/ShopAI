// // app/(customer)/layout.tsx
// import { Header } from "@/components/layout/header";
// import { Footer } from "@/components/layout/footer";
// import { ChatbotWidget } from "@/components/ai/chatbot-widget";

// export default function CustomerLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <Header />
//       <main className="flex-1">{children}</main>
//       <Footer />
//       <ChatbotWidget />
//     </div>
//   );
// }


// app/(customer)/layout.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}