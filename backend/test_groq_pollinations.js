const GROQ_KEYS = [
  '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',
  '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',
  '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',
  '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',
  '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'
];

const POLLINATIONS_KEY = 'sk_zPn6GkASBeODhJeJoE6QF1s2lCwz2al4';

async function testGroq() {
  console.log('--- Testing Groq LLM API Key #1 ---');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEYS[0]}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an AI prompt generator. Respond in JSON format.' },
          { role: 'user', content: 'Generate a short prompt template for a cyberpunk girl.' }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Groq Response Success:');
      console.log(data.choices[0].message.content);
    } else {
      console.error('❌ Groq HTTP Error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('❌ Groq Request Error:', err.message);
  }
}

async function testPollinations() {
  console.log('--- Testing Pollinations AI with Key ---');
  try {
    const prompt = 'candid photograph of a real girl in soft natural lighting';
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&model=flux&key=${POLLINATIONS_KEY}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${POLLINATIONS_KEY}`
      }
    });

    console.log(`Pollinations HTTP Status: ${res.status}`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      console.log(`✅ Received Pollinations AI image buffer size: ${buf.byteLength} bytes`);
    } else {
      console.error('❌ Pollinations AI Error:', res.status);
    }
  } catch (err) {
    console.error('❌ Pollinations Request Error:', err.message);
  }
}

async function main() {
  await testGroq();
  await testPollinations();
}

main();
