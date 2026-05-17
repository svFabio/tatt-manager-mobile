const fs = require('fs');
const path = require('path');

const replacements = {
    // Ivory -> Classic Gold
    '#F5F5F0': '#D4AF37',
    '#FFFFFF': '#E8CC6E', // Ojo: esto reemplazará TODOS los blancos puros, pero como antes eran el light del primary, lo regresaremos a E8CC6E.
    '#D6D6D2': '#B8941F',
    
    // Fix lowercase
    '#f5f5f0': '#D4AF37',
    '#ffffff': '#E8CC6E',
    '#d6d6d2': '#B8941F'
};

const regex = new RegExp(Object.keys(replacements).join('|'), 'gi');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !fullPath.includes('node_modules')) {
            processDirectory(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            content = content.replace(regex, (match) => {
                return replacements[match.toUpperCase()] || match;
            });
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated colors in: ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'src'));
console.log('Color replacement to Classic Gold complete!');
