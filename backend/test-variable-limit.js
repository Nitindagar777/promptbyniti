function limitVariables(promptTemplate, mainPrompt, maxVars = 5) {
  // Find all variables in the template
  const varRegex = /\[([^\]]+)\]/g;
  const variables = [];
  let match;
  while ((match = varRegex.exec(promptTemplate)) !== null) {
    variables.push({
      full: match[0], // [CHARACTER TYPE]
      name: match[1]  // CHARACTER TYPE
    });
  }

  // If variables are within limit, do nothing
  if (variables.length <= maxVars) {
    return { promptTemplate, mainPrompt };
  }

  console.log(`⚠️ Prompt has ${variables.length} variables, which exceeds the max limit of ${maxVars}. Programmatically reducing...`);

  // Construct a regex from the promptTemplate to match and extract values from mainPrompt
  let escapedTemplate = promptTemplate.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  variables.forEach(v => {
    // In escapedTemplate, [VAR] is escaped as \\\\\\\\[VAR\\\\\\\\\\]
    const escapedVar = '\\\\\\[' + v.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\\\\\]';
    escapedTemplate = escapedTemplate.replace(new RegExp(escapedVar, 'g'), '(.*?)');
  });

  try {
    const matcher = new RegExp(`^${escapedTemplate}$`, 'i');
    const matches = mainPrompt.match(matcher);

    if (matches && matches.length === variables.length + 1) {
      let newTemplate = promptTemplate;
      
      for (let i = maxVars; i < variables.length; i++) {
        const value = matches[i + 1];
        newTemplate = newTemplate.replace(variables[i].full, value);
      }

      console.log(`✅ Successfully reduced template variables to ${maxVars}!`);
      return { promptTemplate: newTemplate, mainPrompt };
    } else {
      console.log('❌ Match failed. Matches:', matches);
    }
  } catch (err) {
    console.warn('❌ Exception during matching:', err.message);
  }

  return { promptTemplate, mainPrompt };
}

// Test case
const template = "Silhouette art of a [CHARACTER TYPE], [ACTION POSE], featuring large [WING DETAIL] butterfly wings with [COLOR PALETTE]. The composition includes trailing [DECORATIVE ELEMENTS] and delicate [SHADING STYLE] details. Set against a [BACKGROUND STYLE] background, minimalist aesthetic, sharp ink contrast. --ar 1:1";
const prompt = "Silhouette art of a beautiful fairy, standing gracefully, featuring large glowing blue butterfly wings with gold dust. The composition includes trailing stardust swirls and delicate pencil shading details. Set against a night sky background, minimalist aesthetic, sharp ink contrast. --ar 1:1";

const result = limitVariables(template, prompt, 5);
console.log("Original Template:", template);
console.log("Reduced Template:", result.promptTemplate);
