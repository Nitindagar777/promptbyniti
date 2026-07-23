const mongoose = require('mongoose');
require('dotenv').config();
const Prompt = require('./models/Prompt');

async function testSliceFeed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const start = Date.now();
  const prompts = await Prompt.aggregate([
    { $match: { status: 'approved' } },
    { $sort: { createdAt: -1 } },
    { $limit: 150 },
    {
      $project: {
        _id: 1,
        title: 1,
        name: 1,
        description: 1,
        keywords: 1,
        category: 1,
        generateType: 1,
        model: 1,
        price: 1,
        thumbnail: 1,
        views: 1,
        sales: 1,
        averageRating: 1,
        seller: 1,
        createdAt: 1,
        samples: {
          $slice: [
            {
              $map: {
                input: { $ifNull: ['$samples', []] },
                as: 's',
                in: '$$s.output'
              }
            },
            4
          ]
        }
      }
    }
  ]);

  console.log(`⚡ Native Slice Query Time: ${Date.now() - start}ms`);
  console.log(`Fetched count: ${prompts.length}`);
  if (prompts[0]) {
    console.log('First prompt name:', prompts[0].name || prompts[0].title);
    console.log('First prompt samples count:', prompts[0].samples?.length);
    console.log('First prompt samples:', prompts[0].samples);
  }

  await mongoose.disconnect();
}

testSliceFeed().catch(console.error);
