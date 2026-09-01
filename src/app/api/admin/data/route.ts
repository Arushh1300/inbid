import { NextResponse } from 'next/server';
import { getAdminData } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    // Admin security check
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'inbid_admin_secret_2026';
    if (!key || key !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin passcode' },
        { status: 401 }
      );
    }

    const data = await getAdminData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
