const Parser = require('rss-parser');
const parser = new Parser();

async function run() {
  const feed = await parser.parseURL('https://kocaeligundem.com/rss');
  console.log('Keys of first item:', Object.keys(feed.items[0]));
  console.log('Title:', feed.items[0].title);
  console.log('Link:', feed.items[0].link);
  console.log('Categories:', feed.items[0].categories);
  console.log('Creator:', feed.items[0].creator);
  console.log('Full first item keys and values:', JSON.stringify(feed.items[0], null, 2).substring(0, 1000));
}

run();
