import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://staff.naskaus.com';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Dev-mode admin bypass — only works in development
    if (process.env.NODE_ENV === 'development' && email === 'admin@naskaus.dev' && password === 'admin') {
      const response = NextResponse.json({
        user: { id: 'dev-admin', email: 'admin@naskaus.dev', name: 'Dev Admin', role: 'admin' },
        role: 'admin',
      });
      response.cookies.set('naskaus_token', 'dev-admin-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const data = await backendRes.json();

    const response = NextResponse.json({
      user: data.user,
      role: data.role ?? data.user?.role,
    });

    // Set httpOnly cookie with the JWT token
    response.cookies.set('naskaus_token', data.token ?? data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
