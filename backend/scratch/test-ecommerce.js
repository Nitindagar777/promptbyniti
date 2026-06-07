const generateRouter = require('../routes/generate');
const buildSystemInstruction = generateRouter.buildSystemInstruction;

function runTests() {
  const dummyRules = "1. General rules\n2. More rules";
  
  // Test Product Research subcategory
  console.log("Testing Product Research subcategory...");
  const promptProdRes = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "ECOMMERCE", "Product Research"
  );
  
  if (!promptProdRes.includes("Product Research Prompt")) {
    console.error("❌ Fail: Product Research name missing");
  } else {
    console.log("✅ Pass: Product Research name found");
  }
  
  if (!promptProdRes.includes("Niche/Market: {{niche_or_market}}")) {
    console.error("❌ Fail: Product Research template missing or incorrect");
  } else {
    console.log("✅ Pass: Product Research template found");
  }

  if (!promptProdRes.includes("Dropshipping: shipping time is critical")) {
    console.error("❌ Fail: Product Research custom instruction missing");
  } else {
    console.log("✅ Pass: Product Research custom instruction found");
  }

  // Test Product Listings subcategory
  console.log("Testing Product Listings subcategory...");
  const promptProdList = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "ECOMMERCE", "Product Listings"
  );
  
  if (!promptProdList.includes("Product Listings Prompt")) {
    console.error("❌ Fail: Product Listings name missing");
  } else {
    console.log("✅ Pass: Product Listings name found");
  }

  if (!promptProdList.includes("PRODUCT LISTING COMPLETE PACK:")) {
    console.error("❌ Fail: Product Listings template missing or incorrect");
  } else {
    console.log("✅ Pass: Product Listings template found");
  }

  console.log("All ECOMMERCE subcategory rules resolved successfully!");
}

// Mock SystemSettings model
const mongoose = require('mongoose');
try {
  mongoose.model('SystemSettings');
} catch (e) {
  mongoose.model('SystemSettings', new mongoose.Schema({}));
}

runTests();
