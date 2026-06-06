import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import('@/lib/firebase/admin');

    const { targetUid, isActive, requesterId } = await req.json();

    const requesterDoc = await adminDb.collection('users').doc(requesterId).get();
    if (!requesterDoc.exists || !['super_admin', 'sub_admin'].includes(requesterDoc.data()?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await adminDb.collection('users').doc(targetUid).update({ isActive });
    await adminAuth.updateUser(targetUid, { disabled: !isActive });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
