import { Client } from '@notionhq/client';

const API_KEY = process.env.NOTION_API_KEY?.trim();
const DATABASE_ID = process.env.NOTION_DATABASE_ID?.trim();

const notion = new Client({
  auth: API_KEY,
});

/**
 * Native fetch helper for Notion API queries.
 * This bypasses SDK method inconsistencies.
 */
async function notionFetch(path, options = {}) {
  if (!API_KEY || !DATABASE_ID) {
    throw new Error('NOTION_API_KEY or NOTION_DATABASE_ID is missing');
  }

  const url = `https://api.notion.com/v1/${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Notion API error details:', error);
    throw new Error(error.message || 'Notion API Error');
  }

  return response.json();
}

export async function getThisWeekItems() {
  const response = await notionFetch(`databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: {
      filter: {
        and: [
          {
            property: 'IsGoal',
            checkbox: { equals: false },
          },
          {
            property: 'Answer',
            rich_text: { is_empty: true },
          },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    }
  });

  return response.results.map((page) => {
    const props = page.properties;
    return {
      id: page.id,
      content: props.Title?.title[0]?.plain_text || '',
      type: props.Type?.select?.name || '',
      from: props.From?.select?.name || '',
      to: props.To?.select?.name || '',
      date: props.Date?.date?.start || '',
      answer: props.Answer?.rich_text[0]?.plain_text || '',
    };
  });
}

export async function createItem({ content, type, from, to }) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content } }] },
      Type: { select: { name: type } },
      From: { select: { name: from } },
      To: { select: { name: to } },
      Date: { date: { start: new Date().toISOString().split('T')[0] } },
    },
  });
}

export async function getCurrentGoals() {
  const response = await notionFetch(`databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: {
      filter: {
        and: [
          {
            property: 'IsGoal',
            checkbox: { equals: true },
          },
          {
            property: 'Answer',
            rich_text: { is_empty: true },
          },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    }
  });

  return response.results.map((page) => {
    const props = page.properties;
    return {
      id: page.id,
      content: props.Title?.title[0]?.plain_text || '',
      date: props.Date?.date?.start || '',
      from: props.From?.select?.name || '',
      answer: props.Answer?.rich_text[0]?.plain_text || '',
    };
  });
}

export async function createGoal({ content, from }) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content } }] },
      IsGoal: { checkbox: true },
      From: { select: { name: from } },
      Date: { date: { start: new Date().toISOString().split('T')[0] } },
    },
  });
}

export async function updateAnswer(id, answer) {
  return await notion.pages.update({
    page_id: id,
    properties: {
      Answer: {
        rich_text: [
          {
            text: {
              content: answer,
            },
          },
        ],
      },
    },
  });
}
