// lib/email/resend.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmationEmail(order: {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  items: { name: string; quantity: number; price: number; image?: string }[];
  total: number;
  address: { line1: string; city: string; state: string; pincode: string };
}) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0">
          <strong>${item.name}</strong><br/>
          <span style="color:#666;font-size:13px">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:right">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`,
    )
    .join("");

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: order.email,
    subject: `Order Confirmed! #${order.orderNumber} 🎉`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px;border-radius:16px;text-align:center;margin-bottom:24px">
          <h1 style="color:white;margin:0;font-size:28px">Order Confirmed! 🎉</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Order #${order.orderNumber}</p>
        </div>

        <p style="font-size:16px">Hi ${order.name},</p>
        <p style="color:#555">Your order has been confirmed and is being processed. We'll notify you when it ships.</p>

        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="margin-top:0;color:#333">Order Summary</h3>
          <table style="width:100%;border-collapse:collapse">
            ${itemsHtml}
            <tr>
              <td style="padding:12px;font-weight:bold;font-size:16px">Total</td>
              <td style="padding:12px;font-weight:bold;font-size:16px;text-align:right">₹${order.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="margin-top:0;color:#333">Delivery Address</h3>
          <p style="margin:0;color:#555">${order.address.line1}<br/>${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
        </div>

        <div style="text-align:center;margin-top:32px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}"
             style="background:#667eea;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;display:inline-block">
            Track Your Order
          </a>
        </div>

        <p style="color:#999;font-size:12px;text-align:center;margin-top:32px">
          © 2026 ShopAI · <a href="#" style="color:#999">Unsubscribe</a>
        </p>
      </div>`,
  });
}

export async function sendShippingUpdateEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
}) {
  const statusMessages: Record<string, string> = {
    SHIPPED: "Your order has been shipped! 🚚",
    OUT_FOR_DELIVERY: "Your order is out for delivery! 📦",
    DELIVERED: "Your order has been delivered! ✅",
  };

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: params.email,
    subject: statusMessages[params.status] ?? `Order Update: ${params.status}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2>${statusMessages[params.status] ?? "Order Update"}</h2>
        <p>Hi ${params.name}, your order <strong>#${params.orderNumber}</strong> has been updated.</p>
        ${params.trackingNumber ? `<p>Tracking: <strong>${params.trackingNumber}</strong></p>` : ""}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderId}"
           style="background:#667eea;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Track Order
        </a>
      </div>`,
  });
}
