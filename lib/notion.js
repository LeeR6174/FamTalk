import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function getThisWeekItems() {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - 14);
  lookbackDate.setHours(0, 0, 0, 0);

  // Using notion.request for maximum compatibility across SDK versions
  const response = await notion.request({
    path: `databases/${DATABASE_ID}/query`,
    method: 'POST',
    body: {
      filter: {
        and: [
          {
            property: 'IsGoal',
            checkbox: {
              equals: false,
            },
          },
          {
            or: [
              {
                property: 'Date',
                date: {
                  on_or_after: lookbackDate.toISOString(),
                },
              },
              {
                property: 'Answer',
                rich_text: {
                  is_empty: true,
                },
              },
            ],
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
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - 14);
  lookbackDate.setHours(0, 0, 0, 0);

  const response = await notion.request({
    path: `databases/${DATABASE_ID}/query`,
    method: 'POST',
    body: {
      filter: {
        and: [
          {
            property: 'IsGoal',
            checkbox: { equals: true },
          },
          {
            or: [
              {
                property: 'Date',
                date: { on_or_after: lookbackDate.toISOString() },
              },
              {
                property: 'Answer',
                rich_text: { is_empty: true },
              },
            ],
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
      answer: props.Answer?.rich_text[0]?.plain_text || '',
    };
  });
}

export async function createGoal(content) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content } }] },
      IsGoal: { checkbox: true },
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
