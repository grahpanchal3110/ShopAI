import { prisma } from "@/lib/db/prisma";
import { Mail } from "lucide-react";

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Email Campaigns</h1>
      {campaigns.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No campaigns yet</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Segment</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-muted-foreground">{c.segment}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${c.status === "SENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
