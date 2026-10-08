const fs = require('fs');
const path = require('path');
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const configPath = path.join(appsDir, app, 'drizzle.config.ts');
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    
    if (content.includes('tablesFilter')) {
      return;
    }

    const prefix = app.replace(/-/g, '_');
    content = content.replace(/dbCredentials:\s*\{\s*url:\s*databaseUrl\s*\},?/g, 
      `dbCredentials: { url: databaseUrl },\n  tablesFilter: ["${prefix}_*"],`);

    fs.writeFileSync(configPath, content);
    console.log(`Updated config for ${app}`);
  }
});
