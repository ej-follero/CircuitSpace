import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manifestPath = join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    
    return new NextResponse(manifestContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving manifest.json:', error);
    return NextResponse.json(
      { error: 'Manifest not found', details: error?.message },
      { status: 404 }
    );
  }
}
