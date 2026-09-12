import { updateAnswer } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.id || typeof body.answer !== 'string') {
      return NextResponse.json({ error: 'Answer target and text are required' }, { status: 400 });
    }
    const result = await updateAnswer(body.id, body.answer);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to update answer' }, { status: 500 });
  }
}
