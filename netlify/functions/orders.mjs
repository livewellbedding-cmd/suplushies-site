// Wholesale order history for suplushies.com/order/
// GET  /api/orders?h=<account key>  -> { orders: [...] } newest first (max 25)
// POST /api/orders  { h, order }    -> stores one submitted order
// The account key comes from the customer's private order link (made in Su Desk).
// Anyone holding that link can see that store's past orders, nothing else.
import { getStore } from "@netlify/blobs";

const KEY_RE = /^[A-Za-z0-9_-]{20,48}$/;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function cleanOrder(o) {
  if (!o || typeof o !== "object") return null;
  const lines = Array.isArray(o.lines) ? o.lines.slice(0, 400) : [];
  const clean = lines
    .map((l) => [String(l[0] || "").slice(0, 60), Math.max(0, Math.min(100000, Math.floor(+l[1] || 0))), Math.max(0, +l[2] || 0), String(l[3] || "").slice(0, 200)])
    .filter((l) => l[0] && l[1] > 0);
  if (!clean.length) return null;
  const num = (v) => Math.max(0, Math.round((+v || 0) * 100) / 100);
  return {
    business: String(o.business || "").slice(0, 200),
    lines: clean,
    units: clean.reduce((a, l) => a + l[1], 0),
    subtotal: num(o.subtotal),
    discountPct: Math.min(50, num(o.discountPct)),
    total: num(o.total),
  };
}

export default async (req) => {
  const store = getStore({ name: "wholesale-orders", consistency: "strong" });
  if (req.method === "GET") {
    const h = new URL(req.url).searchParams.get("h") || "";
    if (!KEY_RE.test(h)) return json({ orders: [] });
    const { blobs } = await store.list({ prefix: h + "/" });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 25);
    const orders = (await Promise.all(keys.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
    return json({ orders });
  }
  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
    const h = String(body && body.h || "");
    if (!KEY_RE.test(h)) return json({ error: "bad_key" }, 400);
    const order = cleanOrder(body.order);
    if (!order) return json({ error: "empty_order" }, 400);
    const at = new Date().toISOString();
    const id = at.replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 7);
    await store.setJSON(`${h}/${id}`, { id, at, status: "Submitted", ...order });
    return json({ ok: true, id, at });
  }
  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/orders" };
