const generateRouter = require('./routes/generate');
const buildSystemInstruction = generateRouter.buildSystemInstruction;

function runTests() {
  const dummyRules = "1. Rule one\n2. Rule two";
  
  // Test case 1: Video Same Scene Loop
  console.log("-----------------------------------------");
  console.log("Test Case 1: Video Same Scene Loop (Normal - 5s)");
  const prompt1 = buildSystemInstruction(dummyRules, "normal", "sameSceneLoop", "video", "5s", true);
  
  if (!prompt1.includes("VIDEO DURATION & DETAIL LEVEL — 5S TIER")) {
    console.error("❌ Fail: Video duration tier details missing");
  } else {
    console.log("✅ Pass: Video duration tier details found");
  }
  
  if (!prompt1.includes("🎥 SAME SCENE LOOP MODE - VIDEO")) {
    console.error("❌ Fail: sameSceneLoop rules missing");
  } else {
    console.log("✅ Pass: sameSceneLoop rules found");
  }

  if (!prompt1.includes("Scene 1 (0 to 2.5 seconds)")) {
    console.error("❌ Fail: scene-by-scene timing structure missing in prompt instructions");
  } else {
    console.log("✅ Pass: scene-by-scene timing structure found");
  }

  // Test case 2: Video Different Scenes
  console.log("-----------------------------------------");
  console.log("Test Case 2: Video Different Scenes (Super - 10s)");
  const prompt2 = buildSystemInstruction(dummyRules, "super", "differentScenes", "video", "10s", true);

  if (!prompt2.includes("VIDEO DURATION & DETAIL LEVEL — 10S TIER")) {
    console.error("❌ Fail: Video duration super tier details missing");
  } else {
    console.log("✅ Pass: Video duration super tier details found");
  }

  if (!prompt2.includes("🔄 DIFFERENT SCENES MODE - VIDEO")) {
    console.error("❌ Fail: differentScenes rules missing");
  } else {
    console.log("✅ Pass: differentScenes rules found");
  }

  if (!prompt2.includes("Scene 1 (0 to 3.3 seconds)")) {
    console.error("❌ Fail: 10s scene-by-scene timing structure missing");
  } else {
    console.log("✅ Pass: 10s scene-by-scene timing structure found");
  }

  // Test case 3: Video Fixed Character Motion
  console.log("-----------------------------------------");
  console.log("Test Case 3: Video Fixed Character Motion (Power - 20s)");
  const prompt3 = buildSystemInstruction(dummyRules, "power", "fixedCharacterMotion", "video", "20s", true);

  if (!prompt3.includes("VIDEO DURATION & DETAIL LEVEL — 20S TIER")) {
    console.error("❌ Fail: Video duration power tier details missing");
  } else {
    console.log("✅ Pass: Video duration power tier details found");
  }

  if (!prompt3.includes("📽️ FIXED CHARACTER + MOTION MODE - VIDEO")) {
    console.error("❌ Fail: fixedCharacterMotion rules missing");
  } else {
    console.log("✅ Pass: fixedCharacterMotion rules found");
  }

  if (!prompt3.includes("Scene 1 (0 to 4 seconds)")) {
    console.error("❌ Fail: 20s scene-by-scene timing structure missing");
  } else {
    console.log("✅ Pass: 20s scene-by-scene timing structure found");
  }

  // Test case 4: Mismapped modes compatibility
  console.log("-----------------------------------------");
  console.log("Test Case 4: Mismapped characterMode inputs compatibility");
  const prompt4 = buildSystemInstruction(dummyRules, "normal", "sameScene", "video", "5s", true);
  
  if (!prompt4.includes("🎥 SAME SCENE LOOP MODE - VIDEO")) {
    console.error("❌ Fail: sameScene was not resolved to sameSceneLoop for video");
  } else {
    console.log("✅ Pass: sameScene resolved to sameSceneLoop for video");
  }

  // Test case 5: Custom aspect ratio
  console.log("-----------------------------------------");
  console.log("Test Case 5: Custom aspect ratio propagation (9:16)");
  const prompt5 = buildSystemInstruction(dummyRules, "normal", "sameSceneLoop", "video", "5s", true, "9:16");
  
  if (!prompt5.includes("--ar 9:16")) {
    console.error("❌ Fail: Custom aspect ratio --ar 9:16 not found in instructions");
  } else {
    console.log("✅ Pass: Custom aspect ratio --ar 9:16 found in instructions");
  }

  console.log("-----------------------------------------");
  console.log("All unit tests run.");
}

// Mock SystemSettings mongoose model lookup safely if it doesn't exist
const mongoose = require('mongoose');
try {
  mongoose.model('SystemSettings');
} catch (e) {
  mongoose.model('SystemSettings', new mongoose.Schema({}));
}

runTests();
