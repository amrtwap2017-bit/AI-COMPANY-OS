// Triangle Black — Auth Login API Route
// Proxies login to FastAPI backend using OAuth2 form format

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // FastAPI OAuth2 expects form-urlencoded with 'username' field
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BACKEND}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      return NextResponse.json(
        { error: data.detail || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return token — portal stores it in localStorage
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type || "bearer",
    });

  } catch (err) {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}
