const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function updateRules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const settingsColl = mongoose.connection.db.collection('systemsettings');
    const settings = await settingsColl.findOne();

    if (settings) {
      console.log('Existing rules count:', settings.promptCreationRules.length);

      // Clean up / update the rules
      const updatedRules = settings.promptCreationRules.map(r => {
        let text = r.text;
        
        // Remove leading numbers like "1. ", "2. ", "10. " if they exist
        text = text.replace(/^\d+[\s.)-]+\s*/, '');

        // Rule 1: Replace old "No fixed outputs" rule
        if (text.includes('Use template variables in [SQUARE BRACKETS]') && text.includes('No fixed outputs')) {
          text = 'Use template variables in [SQUARE BRACKETS] for changeable details. Keep the rest of the prompt as high-quality, fixed descriptive text.';
        }

        // Rule 3: Replace old "no variables allowed" rule
        if (text.includes('Random-style prompts') && text.includes('no variables')) {
          text = 'Every prompt template must have a minimum of 1 variable and a maximum of 5 variables. The rest must be fixed descriptive text.';
        }

        return {
          text: text,
          example: r.example || ''
        };
      });

      // Ensure we explicitly add the 1-5 variable limit rule as the very first rule if not already present
      const hasLimitRule = updatedRules.some(r => r.text.includes('maximum of 5 variables') || r.text.includes('MAXIMUM 5'));
      if (!hasLimitRule) {
        updatedRules.unshift({
          text: 'Every prompt template must contain a minimum of 1 and a maximum of 5 bracketed variables. The rest of the prompt must be high-quality, fixed descriptive text.',
          example: 'A photo of a [color] [subject] in [location] --ar 1:1 (3 variables total)'
        });
      }

      await settingsColl.updateOne(
        { _id: settings._id },
        { $set: { promptCreationRules: updatedRules, updatedAt: new Date() } }
      );
      console.log('Successfully updated rules in DB!');
      console.log('New rules:', JSON.stringify(updatedRules, null, 2));
    } else {
      console.log('No settings document found to update.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updateRules();
