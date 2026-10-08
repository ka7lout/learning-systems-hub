import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DATABASE_URL = "postgresql://neondb_owner:npg_Fy0dIAcRH7En@ep-restless-frog-b1gwgznn-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const MONGODB_URI = "mongodb+srv://kahloutbus0_db_user:pAUjwIyy0spOMwET@learningsysos.sguqvcs.mongodb.net/?appName=learningsysos&compressors=zlib";
const AUTH_SECRET = "a_very_secure_random_string_for_auth_secret_12345";
const BETTER_AUTH_SECRET = "learning_systems_secret_better_auth_key_2026_super_secure";
const PUTER_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYyIn0.eyJ0IjoidCIsInYiOiIyIiwidG9rZW5fdWlkIjoiMWEyY2Y5OTgtNTk2Mi00YjZmLWJkOTctMGQzNmZiMTFmYzQxIiwidXUiOiJuZkpLNzhVbVNiMm1sTGJIbG84ZHd3PT0iLCJzdSI6IjhHeHlWY3hVUXl1Sm5LbXRONjUvTkE9PSIsImFpIjoibmZKSzc4VW1TYjJtbExiSGxvOGR3dz09IiwiZnVsbF9hY2Nlc3MiOnRydWUsImlhdCI6MTc5MTI1MDA2MH0.jzyssf5RtXBzzN_fl9JnNCaEMUARIV3ofJlSvvcCj1k";
const PUTER_MODEL_NAME = "deepseek/deepseek-v4-pro";

const apps = [
  { dir: "adaptive-study-v1", project: "lsh-adaptive-study-v1" },
  { dir: "ai-learning-geminiflash", project: "lsh-ai-learning-geminiflash" },
  { dir: "ai-learning-os-v1", project: "lsh-ai-learning-os-v1" },
  { dir: "ai-learning-os-v2", project: "lsh-ai-learning-os-v2" },
  { dir: "ai-learning-os-v3", project: "lsh-ai-learning-os-v3" },
  { dir: "ai-learning-spec-gpt6", project: "lsh-ai-learning-spec-gpt6" },
  { dir: "ai-learning-spec-v1", project: "lsh-ai-learning-spec-v1" },
  { dir: "ai-learning-spec-v3", project: "lsh-ai-learning-spec-v3" },
  { dir: "ai-learning-spec-v4", project: "lsh-ai-learning-spec-v4" },
  { dir: "ihls", project: "lsh-ihls" },
];

function run(cmd, cwd) {
  console.log(`[CMD] ${cmd} (${cwd || "."})`);
  return execSync(cmd, { cwd, stdio: "inherit" });
}

function runSilent(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, stdio: "pipe" }).toString().trim();
  } catch (e) {
    return null;
  }
}

async function deployApp({ dir, project }) {
  console.log(`\n==============================================`);
  console.log(`Deploying ${dir} -> ${project}`);
  console.log(`==============================================\n`);

  const appPath = path.join("/Users/ismail/Downloads/learning_systems/learning-systems-hub/apps", dir);

  // 1. Create project if not exists
  console.log(`1. Ensuring project ${project} exists...`);
  try {
    run(`npx vercel project create ${project}`);
  } catch (e) {
    console.log(`Project ${project} already exists or created.`);
  }

  // 2. Set framework to Next.js
  console.log(`2. Setting framework to Next.js...`);
  try {
    run(`npx vercel project update ${project} --framework nextjs --auto-detect output-directory --auto-detect root-directory --yes`);
  } catch (e) {
    console.error(`Failed to update project settings: ${e.message}`);
  }

  // 3. Disable SSO protection
  console.log(`3. Disabling SSO protection...`);
  try {
    run(`npx vercel project protection disable ${project} --sso`);
  } catch (e) {
    console.log(`SSO protection disable note: ${e.message}`);
  }

  // 4. Clean local .vercel and link
  console.log(`4. Linking local directory...`);
  const localVercel = path.join(appPath, ".vercel");
  if (fs.existsSync(localVercel)) {
    fs.rmSync(localVercel, { recursive: true, force: true });
  }
  run(`npx vercel link --yes --project ${project}`, appPath);

  // 5. Add env vars
  console.log(`5. Setting environment variables...`);
  const envList = [
    ["DATABASE_URL", DATABASE_URL],
    ["AUTH_SECRET", AUTH_SECRET],
    ["BETTER_AUTH_SECRET", BETTER_AUTH_SECRET],
    ["BETTER_AUTH_URL", `https://${project}.vercel.app`],
    ["MONGODB_URI", MONGODB_URI],
    ["PUTER_AUTH_TOKEN", PUTER_AUTH_TOKEN],
    ["PUTER_MODEL_NAME", PUTER_MODEL_NAME],
  ];

  for (const [key, val] of envList) {
    try {
      execSync(`printf "%s" "${val}" | npx vercel env add ${key} production --yes`, { cwd: appPath, stdio: "pipe" });
      console.log(`   + Added ${key}`);
    } catch (e) {
      // Env var may already exist
      console.log(`   ~ ${key} (exists or skipped)`);
    }
  }

  // 6. Deploy to production
  console.log(`6. Deploying to production...`);
  run(`npx vercel deploy --prod --yes`, appPath);

  console.log(`✓ Completed deployment for ${project}: https://${project}.vercel.app`);
}

async function main() {
  for (const app of apps) {
    try {
      await deployApp(app);
    } catch (err) {
      console.error(`Error deploying ${app.dir}:`, err.message);
    }
  }
  console.log("\nAll sub-applications deployment loop finished!");
}

main();
