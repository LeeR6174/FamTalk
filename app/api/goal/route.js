import { getCurrentGoal, updateGoal } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const goal = await getCurrentGoal();
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await updateGoal(body.content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
