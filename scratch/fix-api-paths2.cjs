const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern 3: Multi-line
    const multiLineRegex = /const\s+(API_URL|API_BASE)\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|[\s\S]*?'http:\/\/localhost:8845\/api'\);/g;
    content = content.replace(multiLineRegex, "const $1 = '/api';");

    // Let's also catch the one in PurchaseSuccess.jsx which has space before parenthesis
    const multiLineRegex2 = /const\s+(API_URL|API_BASE)\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|[\s\S]*?'http:\/\/localhost:8845\/api'\)\s*;/g;
    content = content.replace(multiLineRegex2, "const $1 = '/api';");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated multi-line in ${file}`);
    }
});
