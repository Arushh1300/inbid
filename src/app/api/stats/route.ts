import { NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/store';

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}
