import { getCurrentGoals, createGoal, updateGoal } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const goals = await getCurrentGoals({ startDate, endDate });
    return NextResponse.json(goals || []);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Goal content is required' }, { status: 400 });
    }
    const result = await createGoal({ 
      content: body.content.trim(),
      from: body.user || 'Unknown',
      date: body.date
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!body.id || !body.content?.trim()) {
      return NextResponse.json({ error: 'Goal id and content are required' }, { status: 400 });
    }
    const result = await updateGoal(body.id, body.content.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
