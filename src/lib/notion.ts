const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const getAllPublished = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.DATABASE_ID,
    // filter: {
    //   property: "Published",
    //   checkbox: {
    //     equals: true,
    //   },
    // },
    // sorts: [
    //   {
    //     property: "Date",
    //     direction: "descending",
    //   },
    // ],
  });

  const allPosts = posts.results;

  return allPosts.map((post: any) => {
    return getPageMetaData(post);
  });
};

const getPageMetaData = (post: any) => {
  const getTags = (tags: any) => {
    const allTags = tags.map((tag: any) => {
      return tag.name;
    });

    return allTags;
  };

  return {
    id: post.id,
    title: post.properties.Name.title[0].plain_text,
    // tags: getTags(post.properties.Tags.multi_select),
    // description: post.properties.Description.rich_text[0].plain_text,
    date: getToday(post.properties["Created time"].created_time),
    slug: post.properties.Slug.formula.string,
  };
};

function getToday(datestring: any) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let date = new Date();

  if (datestring) {
    date = new Date(datestring);
  }

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let today = `${month} ${day}, ${year}`;

  return today;
}

const { NotionToMarkdown } = require("notion-to-md");
const n2m = new NotionToMarkdown({ notionClient: notion });

// Then, create a new function called getSinglePost in /lib/notion.js.

export const getSinglePost = async (slug: any) => {
  const response = await notion.databases.query({
    database_id: process.env.DATABASE_ID,
    filter: {
      property: "Slug",
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });

  //   console.log(response);

  const page = response.results[0];
  console.log(page);
  const metadata = getPageMetaData(page);
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);

  return {
    metadata,
    markdown: mdString.parent,
  };
};
