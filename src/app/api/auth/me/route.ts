import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://staff.naskaus.com';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('naskaus_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Dev-mode admin bypass
    if (process.env.NODE_ENV === 'development' && token === 'dev-admin-token') {
      return NextResponse.json({
        user: { id: 'dev-admin', email: 'admin@naskaus.dev', name: 'Dev Admin', role: 'admin' },
        role: 'admin',
      });
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await backendRes.json();

    // Backend returns { id, username, email, role, is_active, created_at }
    // Frontend expects { user: { id, email, name, role } }
    const user = {
      id: String(data.id),
      email: data.email,
      name: data.username,
      role: data.role?.toLowerCase() === 'admin' ? 'admin' : 'user',
    };

    return NextResponse.json({
      user,
      role: user.role,
    });
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
