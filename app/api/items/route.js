import { getThisWeekItems, createItem } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const items = await getThisWeekItems({ startDate, endDate });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.content?.trim() || !body.type || !body.from || !body.to) {
      return NextResponse.json({ error: 'Item content, type, from and to are required' }, { status: 400 });
    }
    const result = await createItem({ ...body, content: body.content.trim() });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
