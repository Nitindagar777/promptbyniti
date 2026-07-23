async function testApi() {
  try {
    const res = await fetch('http://localhost:8845/api/prompts');
    const data = await res.json();
    console.log('API success:', data.success);
    console.log('Prompts returned count:', (data.prompts || []).length);
    if (data.prompts && data.prompts.length > 0) {
      console.log('First prompt:', data.prompts[0].title || data.prompts[0].name);
      console.log('Last prompt:', data.prompts[data.prompts.length - 1].title || data.prompts[data.prompts.length - 1].name);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testApi();
