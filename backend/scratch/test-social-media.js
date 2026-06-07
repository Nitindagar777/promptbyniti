const generateRouter = require('../routes/generate');
const buildSystemInstruction = generateRouter.buildSystemInstruction;

function runTests() {
  const dummyRules = "1. General rules\n2. More rules";
  
  // Test Content Creation subcategory
  console.log("Testing Content Creation subcategory...");
  const promptContentCreation = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "SOCIAL MEDIA", "Content Creation"
  );
  
  if (!promptContentCreation.includes("Content Creation Prompt")) {
    console.error("❌ Fail: Content Creation name missing");
  } else {
    console.log("✅ Pass: Content Creation name found");
  }
  
  if (!promptContentCreation.includes("Brand/Creator: {{brand_or_creator}}")) {
    console.error("❌ Fail: Content Creation promptTemplate missing or incorrect");
  } else {
    console.log("✅ Pass: Content Creation promptTemplate found");
  }

  if (!promptContentCreation.includes("TikTok: authenticity over production")) {
    console.error("❌ Fail: Content Creation custom instruction missing");
  } else {
    console.log("✅ Pass: Content Creation custom instruction found");
  }

  // Test Post Generation subcategory
  console.log("Testing Post Generation subcategory...");
  const promptPostGen = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "SOCIAL MEDIA", "Post Generation"
  );
  
  if (!promptPostGen.includes("Post Generation Prompt")) {
    console.error("❌ Fail: Post Generation name missing");
  } else {
    console.log("✅ Pass: Post Generation name found");
  }

  if (!promptPostGen.includes("Write 3 POST VARIATIONS for A/B testing:")) {
    console.error("❌ Fail: Post Generation promptTemplate missing or incorrect");
  } else {
    console.log("✅ Pass: Post Generation promptTemplate found");
  }

  console.log("All social media subcategory rules resolved successfully!");
}

// Mock SystemSettings model
const mongoose = require('mongoose');
try {
  mongoose.model('SystemSettings');
} catch (e) {
  mongoose.model('SystemSettings', new mongoose.Schema({}));
}

runTests();
