import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const form = new URLSearchParams();
    form.append("username", body.email || body.username || "");
    form.append("password", body.password || "");

    const res = await fetch("http://localhost:8030/api/v1/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "Login failed" },
        { status: res.status }
      );
    }

    // Return token to client
    const response = NextResponse.json({
      token:        data.access_token,
      access_token: data.access_token,
      role:         data.role,
      name:         data.name,
      email:        body.email,
    });

    // Set httpOnly cookie so proxy.ts can read it
    response.cookies.set("tb_access_token", data.access_token, {
      httpOnly: false,
      secure:   false,
      sameSite: "lax",
      maxAge:   28800,
      path:     "/",
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
