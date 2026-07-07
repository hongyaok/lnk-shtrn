const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// Replace fonts
css = css.replace(/font-family:\s*'Roboto Mono',\s*monospace;/g, "font-family: 'Pixelify Sans', sans-serif;");

// Replace border-radius to make it blocky (0px)
css = css.replace(/border-radius:\s*[^;]+;/g, 'border-radius: 0;');

// Make borders chunkier
css = css.replace(/border:\s*1px\s*/g, 'border: 2px ');

// Remove backdrop-filter blurs
css = css.replace(/backdrop-filter:\s*blur[^;]+;/g, 'backdrop-filter: none;');
css = css.replace(/-webkit-backdrop-filter:\s*blur[^;]+;/g, '-webkit-backdrop-filter: none;');

// Make box shadows blocky instead of soft
css = css.replace(/box-shadow:\s*0\s+10px\s+20px\s+-10px\s+rgba\([^)]+\);/g, 'box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.2);');
css = css.replace(/box-shadow:\s*0\s+0\s+0\s+3px\s+rgba\(([^)]+)\);/g, 'box-shadow: 4px 4px 0px rgba($1);');
css = css.replace(/box-shadow:\s*0\s+4px\s+12px\s+rgba\([^)]+\);/g, 'box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.2);');

// Update text shadows for blocky pulse
css = css.replace(/text-shadow:\s*0\s+0\s+20px\s+rgba\([^)]+\);/g, 'text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);');
css = css.replace(/text-shadow:\s*0\s+0\s+30px\s+rgba\([^)]+\);/g, 'text-shadow: 4px 4px 0px rgba(255, 255, 255, 0.8);');

// Change background rgba to be more solid since there is no blur
css = css.replace(/background:\s*rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*0\.0[0-9]\);/g, 'background: rgba($1, $2, $3, 0.85);');
css = css.replace(/background:\s*rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*0\.1[0-9]?\);/g, 'background: rgba($1, $2, $3, 0.95);');

fs.writeFileSync('src/index.css', css, 'utf-8');
console.log('Updated index.css!');
