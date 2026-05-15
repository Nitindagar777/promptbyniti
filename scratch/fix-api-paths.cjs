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

    // Pattern 1: Inline fetches like `${import.meta.env.VITE_API_URL || 'http://localhost:8845/api'}/auth/me`
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:8845\/api'\}/g, '/api');

    // Pattern 2: Single line const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8845/api';
    content = content.replace(/const\s+(API_URL|API_BASE)\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:8845\/api'\s*;/g, "const $1 = '/api';");

    // Pattern 3: Multi-line const API_BASE = ... ? '...' : '...');
    const multiLineRegex = /const\s+(API_URL|API_BASE)\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|[\s\S]*?\?'[^']*'\s*:\s*'http:\/\/localhost:8845\/api'\);/g;
    content = content.replace(multiLineRegex, "const $1 = '/api';");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
