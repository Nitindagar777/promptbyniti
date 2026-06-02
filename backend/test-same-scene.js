async function runTest() {
  try {
    const payload = {
      description: "A young East Asian woman with short black hair resting her chin on her hand, wearing a blue and white checkered shirt, rapeseed flower field",
      characterImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", // dummy base64
      promptType: "image",
      model: "Midjourney",
      mode: "prompt",
      aiPower: "normal",
      characterMode: "sameScene"
    };

    console.log('Sending request to /api/generate using native fetch...');
    const res = await fetch('http://localhost:8845/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('TEST ERROR:', err.message);
  }
}

runTest();
