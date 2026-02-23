// // app/(admin)/admin/reviews/page.tsx
// import { prisma } from "@/lib/db/prisma";
// import { requireAdmin } from "@/lib/auth/get-user";
// import { ReviewModerationTable } from "@/components/dashboard/review-moderation-table";

// export default async function AdminReviewsPage() {
//   await requireAdmin();

//   const flaggedReviews = await prisma.review.findMany({
//     where: { OR: [{ isFlagged: true }, { isApproved: false }] },
//     include: {
//       user: { select: { name: true, email: true } },
//       product: { select: { name: true, slug: true } },
//     },
//     orderBy: { createdAt: "desc" },
//     take: 50,
//   });

//   const stats = await prisma.review.groupBy({
//     by: ["sentimentLabel"],
//     _count: true,
//     where: { sentimentLabel: { not: null } },
//   });

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Review Moderation</h1>

//       {/* Sentiment Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         {stats.map((s) => (
//           <div key={s.sentimentLabel} className="bg-card border rounded-xl p-4">
//             <p className="text-sm text-muted-foreground capitalize">
//               {s.sentimentLabel}
//             </p>
//             <p className="text-2xl font-bold">{s._count}</p>
//           </div>
//         ))}
//       </div>

//       <ReviewModerationTable reviews={flaggedReviews} />
//     </div>
//   );
// }

import { prisma } from "@/lib/db/prisma";
import { ReviewModerationTable } from "@/components/dashboard/review-moderation-table";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { OR: [{ isFlagged: true }, { isApproved: false }] },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Moderation</h1>
      <ReviewModerationTable reviews={reviews as any} />
    </div>
  );
}
