import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const { text, filterStopWords, customStopWords } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = analyzeText(text, { filterStopWords, customStopWords });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
