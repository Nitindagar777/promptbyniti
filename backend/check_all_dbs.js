const mongoose = require('mongoose');
require('dotenv').config();

async function checkDbs() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://nitindagar:nitindagar0800@nitin.w8mylqb.mongodb.net/';
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log('Connected to cluster!');
  const admin = conn.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Databases on cluster:', dbs.databases.map(d => d.name));

  for (const dbInfo of dbs.databases) {
    if (['admin', 'local'].includes(dbInfo.name)) continue;
    const dbConn = await mongoose.createConnection(`${uri}${dbInfo.name}`).asPromise();
    const collections = await dbConn.db.listCollections().toArray();
    console.log(`\nDatabase: "${dbInfo.name}" Collections:`, collections.map(c => c.name));
    for (const col of collections) {
      if (col.name === 'prompts') {
        const count = await dbConn.db.collection('prompts').countDocuments({ status: 'approved' });
        console.log(`  -> "${dbInfo.name}".prompts approved count: ${count}`);
      }
    }
    await dbConn.close();
  }

  await conn.close();
}

checkDbs().catch(console.error);
