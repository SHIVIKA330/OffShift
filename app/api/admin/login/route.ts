import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD || "offshift";
  if (!expected) {
    // This case is now theoretically unreachable due to the fallback, but kept for robustness
    return NextResponse.json({ error: "ADMIN_PASSWORD not set" }, { status: 500 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.password !== expected) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("offshift_admin", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
