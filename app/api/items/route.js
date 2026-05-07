import { getThisWeekItems, createItem } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = await getThisWeekItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createItem(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
