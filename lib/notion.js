import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function getThisWeekItems() {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: startOfWeek.toISOString(),
          },
        },
        {
          property: 'IsGoal',
          checkbox: {
            equals: false,
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results.map((page) => ({
    id: page.id,
    content: page.properties.Title.title[0]?.plain_text || '',
    type: page.properties.Type.select?.name || '',
    from: page.properties.From.select?.name || '',
    to: page.properties.To.select?.name || '',
    date: page.properties.Date.date?.start || '',
    answer: page.properties.Answer.rich_text[0]?.plain_text || '',
  }));
}

export async function createItem({ content, type, from, to }) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: {
        title: [
          {
            text: {
              content,
            },
          },
        ],
      },
      Type: {
        select: {
          name: type,
        },
      },
      From: {
        select: {
          name: from,
        },
      },
      To: {
        select: {
          name: to,
        },
      },
      Date: {
        date: {
          start: new Date().toISOString().split('T')[0],
        },
      },
    },
  });
}

export async function getCurrentGoals() {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'IsGoal',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_after: startOfWeek.toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results.map((page) => ({
    id: page.id,
    content: page.properties.Title.title[0]?.plain_text || '',
    date: page.properties.Date.date?.start || '',
    answer: page.properties.Answer.rich_text[0]?.plain_text || '',
  }));
}

export async function updateGoal(content) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: {
        title: [
          {
            text: {
              content,
            },
          },
        ],
      },
      IsGoal: {
        checkbox: true,
      },
      Date: {
        date: {
          start: new Date().toISOString().split('T')[0],
        },
      },
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
