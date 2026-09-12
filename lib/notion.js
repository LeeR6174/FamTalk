import { Client } from '@notionhq/client';
import { getLocalDateString } from './dateUtils';

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

async function queryDatabase(body) {
  const results = [];
  let cursor;
  do {
    const response = await notionFetch(`databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: { ...body, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);
  return results;
}

export async function getThisWeekItems({ startDate, endDate } = {}) {
  const filters = [
    {
      property: 'IsGoal',
      checkbox: { equals: false },
    }
  ];

  if (startDate) {
    filters.push({
      property: 'Date',
      date: { on_or_after: startDate }
    });
  }
  if (endDate) {
    filters.push({
      property: 'Date',
      date: { on_or_before: endDate }
    });
  }

  const pages = await queryDatabase({
    filter: {
      and: filters,
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  const allItems = pages.map((page) => {
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

  // If no date range is specified, return items from the last 7 days of the latest date
  if (!startDate && !endDate && allItems.length > 0) {
    const latestDate = new Date(allItems[0].date);
    const sevenDaysAgo = getLocalDateString(new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    return allItems.filter(item => item.date >= sevenDaysAgo);
  }

  return allItems;
}

export async function createItem({ content, type, from, to, date }) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content } }] },
      Type: { select: { name: type } },
      From: { select: { name: from } },
      To: { select: { name: to } },
      Date: { date: { start: date || getLocalDateString() } },
    },
  });
}

export async function getCurrentGoals({ startDate, endDate } = {}) {
  const filters = [
    {
      property: 'IsGoal',
      checkbox: { equals: true },
    }
  ];

  if (startDate) {
    filters.push({
      property: 'Date',
      date: { on_or_after: startDate }
    });
  }
  if (endDate) {
    filters.push({
      property: 'Date',
      date: { on_or_before: endDate }
    });
  }

  const pages = await queryDatabase({
    filter: {
      and: filters,
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  const allGoals = pages.map((page) => {
    const props = page.properties;
    return {
      id: page.id,
      content: props.Title?.title[0]?.plain_text || '',
      date: props.Date?.date?.start || '',
      from: props.From?.select?.name || '',
      answer: props.Answer?.rich_text[0]?.plain_text || '',
    };
  });

  // If no date range is specified (e.g. for the home page), return the goals from the week containing the most recent date.
  // We cover Sunday to Saturday of that week, plus the Saturday before Sunday to support older Saturday-saved goals.
  if (!startDate && !endDate && allGoals.length > 0) {
    const mostRecentDateStr = allGoals[0].date;
    const mostRecentDate = new Date(mostRecentDateStr);
    
    // Find Sunday of the week containing mostRecentDate
    const sunday = new Date(mostRecentDate);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    
    // Cover the preceding Saturday (to support old Saturday-saved goals)
    const saturdayBefore = new Date(sunday);
    saturdayBefore.setDate(saturdayBefore.getDate() - 1);
    
    // Cover the following Saturday (end of week containing mostRecentDate)
    const saturdayAfter = new Date(sunday);
    saturdayAfter.setDate(saturdayAfter.getDate() + 6);
    
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startStr = format(saturdayBefore);
    const endStr = format(saturdayAfter);
    
    return allGoals.filter(g => g.date >= startStr && g.date <= endStr);
  }

  return allGoals;
}

export async function createGoal({ content, from, date }) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content } }] },
      IsGoal: { checkbox: true },
      From: { select: { name: from } },
      Date: { date: { start: date || getLocalDateString() } },
    },
  });
}

export async function updateGoal(id, content) {
  return await notion.pages.update({
    page_id: id,
    properties: {
      Title: { title: [{ text: { content } }] },
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
