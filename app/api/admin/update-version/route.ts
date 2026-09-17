import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    // 1. Authenticate check via secure cookie session
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session has expired or is invalid.' }, { status: 401 });
    }

    // 2. Parse and validate the incoming update details
    const body = await request.json();
    const { latest_version, min_supported_version, force_update, whats_new, download_url } = body;

    if (!latest_version || !min_supported_version) {
      return NextResponse.json({ success: false, error: 'Version numbers are required fields.' }, { status: 400 });
    }

    // Prepare clean standard format as requested
    const appVersionJson = {
      latest_version: String(latest_version).trim(),
      min_supported_version: String(min_supported_version).trim(),
      force_update: Boolean(force_update),
      whats_new: Array.isArray(whats_new) ? whats_new : [],
      download_url: {
        android: String(download_url?.android || '').trim(),
        windows: String(download_url?.windows || '').trim(),
        macos: String(download_url?.macos || '').trim()
      }
    };

    // 3. Verify Vercel Blob configuration
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'BLOB_READ_WRITE_TOKEN is missing or not configured.' },
        { status: 500 }
      );
    }

    // 4. Overwrite live file on Vercel Blob with addRandomSuffix: false, allowOverwrite: true
    const blob = await put('app-version.json', JSON.stringify(appVersionJson, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      token: token,
    });

    return NextResponse.json({
      success: true,
      message: 'Version manifest saved and live-updated on Vercel Blob.',
      url: blob.url
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'An error occurred while updating the app version manifest.' },
      { status: 500 }
    );
  }
}
