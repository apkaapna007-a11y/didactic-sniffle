import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        valid: true,
        models: data.data?.slice(0, 50) || [],
        message: 'API key validated successfully',
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: errorData.error?.message || 'Invalid API key',
      });
    }
  } catch (error) {
    console.error('API validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
