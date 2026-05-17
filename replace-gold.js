const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  ['#A8A0B4', '#4D09E0'],  // primary
  ['#a8a0b4', '#4d09e0'],
  ['#BEB6C8', '#7B3FF5'],  // light
  ['#beb6c8', '#7b3ff5'],
  ['#908AA0', '#3A07A8'],  // dark
  ['#908aa0', '#3a07a8'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    for (const [oldVal, newVal] of REPLACEMENTS) {
        if (content.includes(oldVal)) {
            content = content.split(oldVal).join(newVal);
            modified = true;
        }
    }
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.expo') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath) && !fullPath.includes('replace-gold') && !fullPath.includes('apply-new-theme')) {
            replaceInFile(fullPath);
        }
    }
}

const twPath = path.join(__dirname, 'tailwind.config.js');
let tw = fs.readFileSync(twPath, 'utf8');
tw = tw.replace(/"#A8A0B4"/g, '"#4D09E0"');
tw = tw.replace(/"#BEB6C8"/g, '"#7B3FF5"');
tw = tw.replace(/"#908AA0"/g, '"#3A07A8"');
fs.writeFileSync(twPath, tw, 'utf8');
console.log('Updated tailwind.config.js');

walk(__dirname);
console.log('Done!');
