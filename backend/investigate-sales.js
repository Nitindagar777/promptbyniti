// investigate-sales.js — Find who "purchased" prompts with sales > 0
require('dotenv').config();
const mongoose = require('mongoose');

async function investigate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const promptsColl = db.collection('prompts');
    const usersColl = db.collection('users');

    // 1. Find all prompts with sales > 0
    console.log('════════════════════════════════════════════════════════');
    console.log('  PROMPTS WITH SALES > 0');
    console.log('════════════════════════════════════════════════════════\n');
    
    const promptsWithSales = await promptsColl.find({ sales: { $gt: 0 } }).toArray();
    
    if (promptsWithSales.length === 0) {
      console.log('  No prompts with sales found.\n');
    } else {
      for (const p of promptsWithSales) {
        const seller = await usersColl.findOne({ _id: p.seller });
        console.log(`  📦 Prompt: "${p.name || p.title}"`);
        console.log(`     ID: ${p._id}`);
        console.log(`     Seller: ${seller?.name || 'Unknown'} (${seller?.email || 'N/A'})`);
        console.log(`     Seller ID: ${p.seller}`);
        console.log(`     Price: ${p.priceTokens || p.tokens || 5} tokens`);
        console.log(`     Sales Count: ${p.sales}`);
        console.log(`     Created: ${p.createdAt}`);
        console.log('');
      }
    }

    // 2. Get all prompt IDs that have sales
    const promptIdsWithSales = promptsWithSales.map(p => p._id);

    // 3. Find ALL users who have ANY of these prompt IDs in their purchasedPrompts
    console.log('════════════════════════════════════════════════════════');
    console.log('  USERS WHO HAVE THESE PROMPTS IN purchasedPrompts');
    console.log('════════════════════════════════════════════════════════\n');

    const buyers = await usersColl.find({
      purchasedPrompts: { $in: promptIdsWithSales }
    }).toArray();

    if (buyers.length === 0) {
      console.log('  ❌ NO USERS have these prompts in their purchasedPrompts array!');
      console.log('  ➡️  This confirms the sales are GHOST SALES — no actual purchases occurred.\n');
    } else {
      for (const buyer of buyers) {
        const matchedPrompts = promptsWithSales.filter(p => 
          buyer.purchasedPrompts.some(pp => pp.toString() === p._id.toString())
        );
        console.log(`  👤 User: ${buyer.name} (${buyer.email})`);
        console.log(`     Credits: ${buyer.credits}`);
        console.log(`     Total Purchased Prompts: ${buyer.purchasedPrompts?.length || 0}`);
        for (const mp of matchedPrompts) {
          console.log(`     - Purchased: "${mp.name || mp.title}" (${mp._id})`);
        }
        console.log('');
      }
    }

    // 4. Check ALL users for any purchasedPrompts at all
    console.log('════════════════════════════════════════════════════════');
    console.log('  ALL USERS — FULL purchasedPrompts AUDIT');
    console.log('════════════════════════════════════════════════════════\n');

    const allUsers = await usersColl.find({}).toArray();
    let anyPurchases = false;
    
    for (const u of allUsers) {
      const purchaseCount = u.purchasedPrompts?.length || 0;
      const sellerPrompts = await promptsColl.find({ seller: u._id }).toArray();
      const sellerSales = sellerPrompts.reduce((sum, p) => sum + (p.sales || 0), 0);
      
      console.log(`  👤 ${u.name} (${u.email})`);
      console.log(`     Credits: ${u.credits} | WalletTokens: ${u.walletTokens || 0}`);
      console.log(`     Purchased Prompts: ${purchaseCount}`);
      console.log(`     Prompts Created (as seller): ${sellerPrompts.length}`);
      console.log(`     Total Sales on Their Prompts: ${sellerSales}`);
      
      if (purchaseCount > 0) {
        anyPurchases = true;
        console.log(`     ⚡ Purchased IDs: ${u.purchasedPrompts.map(p => p.toString()).join(', ')}`);
      }

      // Check if seller bought their own prompts
      if (purchaseCount > 0 && sellerPrompts.length > 0) {
        const selfBuys = sellerPrompts.filter(sp => 
          u.purchasedPrompts.some(pp => pp.toString() === sp._id.toString())
        );
        if (selfBuys.length > 0) {
          console.log(`     🚨 SELF-PURCHASE DETECTED! Bought own prompt(s):`);
          selfBuys.forEach(sb => console.log(`        - "${sb.name || sb.title}" (${sb._id})`));
        }
      }
      console.log('');
    }

    if (!anyPurchases) {
      console.log('  ═══════════════════════════════════════════════════');
      console.log('  🔴 CONCLUSION: NO USER HAS ANY PURCHASED PROMPTS');
      console.log('  🔴 All sales counters are PHANTOM / GHOST SALES');
      console.log('  ═══════════════════════════════════════════════════\n');
    }

    // 5. Total sales summary
    const allPrompts = await promptsColl.find({}).toArray();
    const totalSales = allPrompts.reduce((sum, p) => sum + (p.sales || 0), 0);
    console.log('════════════════════════════════════════════════════════');
    console.log(`  TOTAL SALES ACROSS ALL PROMPTS: ${totalSales}`);
    console.log('════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Done. Database connection closed.');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

investigate();
