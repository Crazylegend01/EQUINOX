import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Dynamically import to avoid edge runtime issues
    const { adminAuth, adminDb } = await import('@/lib/firebase/admin');

    const { targetUid, role, permissions, requesterId } = await req.json();

    // Verify requester is super_admin
    const requesterDoc = await adminDb.collection('users').doc(requesterId).get();
    if (!requesterDoc.exists || requesterDoc.data()?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update Firestore
    await adminDb.collection('users').doc(targetUid).update({
      role,
      permissions: permissions ?? null,
    });

    // Set custom claims for quick server-side checks
    await adminAuth.setCustomUserClaims(targetUid, { role, permissions });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
