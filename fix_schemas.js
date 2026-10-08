const fs = require('fs');
const path = require('path');
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const schemaPath = path.join(appsDir, app, 'src/db/schema.ts');
  if (fs.existsSync(schemaPath)) {
    let content = fs.readFileSync(schemaPath, 'utf8');
    
    if (content.includes('pgTableCreator')) {
      console.log(`Skipping ${app}, already prefixed.`);
      return;
    }

    const importRegex = /import\s+{([^}]+)}\s+from\s+["']drizzle-orm\/pg-core["'];/;
    content = content.replace(importRegex, (match, p1) => {
      const newImports = p1.replace(/\bpgTable\b/, 'pgTableCreator');
      return `import { ${newImports} } from "drizzle-orm/pg-core";\n\nexport const pgTable = pgTableCreator((name) => "${app.replace(/-/g, '_')}_" + name);`;
    });

    fs.writeFileSync(schemaPath, content);
    console.log(`Updated ${app}`);
  }
});
