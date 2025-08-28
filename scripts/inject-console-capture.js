const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function injectConsoleCapture() {
  const buildDir = path.join(process.cwd(), '.next');
  const serverDir = path.join(buildDir, 'server');
  
  if (!fs.existsSync(serverDir)) {
    console.log('Build directory not found. Skipping console capture injection.');
    return;
  }

  const scriptTag = '<script src="/dashboard-console-capture.js"></script>';
  const htmlFiles = await glob('**/*.html', { cwd: serverDir });

  let injectedCount = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(serverDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if script is already injected
    if (content.includes('/dashboard-console-capture.js')) {
      continue;
    }

    // Inject script into head section
    const headRegex = /<head[^>]*>/i;
    if (headRegex.test(content)) {
      content = content.replace(headRegex, (match) => `${match}\n  ${scriptTag}`);
      fs.writeFileSync(filePath, content);
      injectedCount++;
    }
  }

  console.log(`Console capture script injected into ${injectedCount} HTML files.`);
}

injectConsoleCapture().catch(console.error);