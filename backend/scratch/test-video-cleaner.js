const generateRouter = require('../routes/generate');

// Retrieve the post-processing helper functions by mocking a response or extracting from file/closure
// Actually, let's write a small unit test here by reproducing the regexes from generate.js to verify they behave as expected.

const stripLabel = (s) => s.replace(/^(Variation\s*\d*[:.\-]\s*|Example\s*\d*[:.\-]\s*|Sample\s*[A-C\d]*[:.\-]\s*|Version\s*\d*[:.\-]\s*|\d+[:.)\-]\s*)/i, '').trim();
const ensureAR16_9 = (s) => {
  const cleaned = s.replace(/\s*--ar\s+\S+/g, '').trim();
  return cleaned + ' --ar 16:9';
};

const cleanVideoPrompt = (s) => {
  if (!s) return '';
  let cleaned = stripLabel(s).trim();
  
  // 1. Remove all square brackets [] to prevent metadata safety blockages, keeping text inside if there's any.
  cleaned = cleaned.replace(/[\[\]]/g, '');

  // 2. Ensure it starts with "Generate a video of" or "A cinematic video of"
  const startsWithVideo = /^\s*(generate\s+a\s+video|a\s+cinematic\s+video)/i.test(cleaned);
  if (!startsWithVideo) {
    if (/^\s*scene\s*1/i.test(cleaned)) {
      cleaned = 'Generate a video of: ' + cleaned;
    } else {
      cleaned = 'Generate a video of ' + cleaned;
    }
  }

  // 3. Normalize scene timing structures to avoid mathematical hyphens (e.g. 0s-2.5s -> 0 to 2.5 seconds)
  cleaned = cleaned.replace(/scene\s*(\d+)\s*\(\s*(\d+(\.\d+)?)\s*s?\s*-\s*(\d+(\.\d+)?)\s*s?\s*\)/gi, 'Scene $1 ($2 to $4 seconds)');
  
  // Normalize any leftover uppercase SCENE to Scene
  cleaned = cleaned.replace(/\bSCENE\b/g, 'Scene');

  return cleaned;
};

// Test suite
const testCases = [
  {
    input: "SCENE 1 (0s-2.5s): [Establish static frame] A beautiful butterfly dancing. [MOTION: subtle motion] SCENE 2 (2.5s-5s): It flys away.",
    expected: "Generate a video of: Scene 1 (0 to 2.5 seconds): Establish static frame A beautiful butterfly dancing. MOTION: subtle motion Scene 2 (2.5 to 5 seconds): It flys away. --ar 16:9"
  },
  {
    input: "Generate a video of Scene 1 (0s-3.3s): character walking. Scene 2 (3.3s-6.6s): character sits down. Scene 3 (6.6s-10s): character smiles.",
    expected: "Generate a video of Scene 1 (0 to 3.3 seconds): character walking. Scene 2 (3.3 to 6.6 seconds): character sits down. Scene 3 (6.6 to 10 seconds): character smiles. --ar 16:9"
  },
  {
    input: "Sample A: SCENE 1 (0s-4s): a girl dancing. SCENE 2 (4s-8s): she spins. SCENE 3 (8s-12s): she smiles.",
    expected: "Generate a video of: Scene 1 (0 to 4 seconds): a girl dancing. Scene 2 (4 to 8 seconds): she spins. Scene 3 (8 to 12 seconds): she smiles. --ar 16:9"
  }
];

testCases.forEach((tc, index) => {
  const result = ensureAR16_9(cleanVideoPrompt(tc.input));
  console.log(`\nTest Case ${index + 1}:`);
  console.log(`Input:    ${tc.input}`);
  console.log(`Output:   ${result}`);
  if (result === tc.expected) {
    console.log("✅ Pass");
  } else {
    console.error(`❌ Fail: Expected: "${tc.expected}"`);
  }
});
