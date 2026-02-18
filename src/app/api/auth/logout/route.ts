import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://staff.naskaus.com';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('naskaus_token')?.value;

    if (token) {
      // Best-effort call to backend logout
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {});
    }

    const response = NextResponse.json({ ok: true });

    // Clear the cookie
    response.cookies.set('naskaus_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: true });
  }
}
