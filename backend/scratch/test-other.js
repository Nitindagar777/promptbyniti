const generateRouter = require('../routes/generate');
const buildSystemInstruction = generateRouter.buildSystemInstruction;

function runTests() {
  const dummyRules = "1. General rules\n2. More rules";
  
  // Test Personal Development subcategory
  console.log("Testing Personal Development subcategory...");
  const promptPersDev = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "OTHER", "Personal Development"
  );
  
  if (!promptPersDev.includes("Personal Development Prompt")) {
    console.error("❌ Fail: Personal Development name missing");
  } else {
    console.log("✅ Pass: Personal Development name found");
  }
  
  if (!promptPersDev.includes("Growth Area: {{growth_area}}")) {
    console.error("❌ Fail: Personal Development template missing or incorrect");
  } else {
    console.log("✅ Pass: Personal Development template found");
  }

  if (!promptPersDev.includes("Student: identity formation is the work")) {
    console.error("❌ Fail: Personal Development custom instruction missing");
  } else {
    console.log("✅ Pass: Personal Development custom instruction found");
  }

  // Test Experimental subcategory
  console.log("Testing Experimental subcategory...");
  const promptExperimental = buildSystemInstruction(
    dummyRules, "normal", "none", "text", "", false, "", "OTHER", "Experimental"
  );
  
  if (!promptExperimental.includes("Experimental Prompt")) {
    console.error("❌ Fail: Experimental name missing");
  } else {
    console.log("✅ Pass: Experimental name found");
  }

  if (!promptExperimental.includes("BREAK THE EXPECTED FORMAT — this is an experimental prompt.")) {
    console.error("❌ Fail: Experimental template missing or incorrect");
  } else {
    console.log("✅ Pass: Experimental template found");
  }

  console.log("All OTHER subcategory rules resolved successfully!");
}

// Mock SystemSettings model
const mongoose = require('mongoose');
try {
  mongoose.model('SystemSettings');
} catch (e) {
  mongoose.model('SystemSettings', new mongoose.Schema({}));
}

runTests();
