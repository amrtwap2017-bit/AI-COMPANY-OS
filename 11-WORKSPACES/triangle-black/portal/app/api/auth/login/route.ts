import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8030";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await fetch(API_URL + "/api/v1/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail || "Invalid credentials" },
        { status: 401 }
      );
    }
    const data = await res.json();
    const token = data.access_token;
    if (!token) {
      return NextResponse.json({ error: "No token received" }, { status: 500 });
    }
    const response = NextResponse.json({
      ok:    true,
      user:  data.user || null,
      token: token,
    });
    response.cookies.set("tb_access_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 8,
      path:     "/",
    });
    return response;
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Login failed" },
      { status: 500 }
    );
  }
}
