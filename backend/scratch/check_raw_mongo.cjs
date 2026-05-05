const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkRaw() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB Raw');
    const db = client.db('test');
    const prompts = await db.collection('prompts').find({ status: 'approved' }).project({ name: 1 }).toArray();
    console.log('Prompts found:', prompts.length);
    console.log('Names:', prompts.map(p => p.name));
  } catch (err) {
    console.error('Raw check failed:', err);
  } finally {
    await client.close();
  }
}

checkRaw();
