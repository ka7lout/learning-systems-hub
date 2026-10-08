import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const portalPath = "/Users/ismail/Downloads/learning_systems/learning-systems-hub/apps/portal";
const mainProject = "adaptive-study-v1";

function run(cmd, cwd) {
  console.log(`[CMD] ${cmd} (${cwd || "."})`);
  return execSync(cmd, { cwd, stdio: "inherit" });
}

async function main() {
  console.log(`\n==============================================`);
  console.log(`Deploying PORTAL to MAIN PROJECT ${mainProject}`);
  console.log(`==============================================\n`);

  console.log(`1. Setting framework to Next.js on ${mainProject}...`);
  try {
    run(`npx vercel project update ${mainProject} --framework nextjs --auto-detect output-directory --auto-detect root-directory --yes`);
  } catch (e) {
    console.error(`Update settings note: ${e.message}`);
  }

  console.log(`2. Disabling SSO protection on ${mainProject}...`);
  try {
    run(`npx vercel project protection disable ${mainProject} --sso`);
  } catch (e) {
    console.error(`Protection note: ${e.message}`);
  }

  console.log(`3. Linking apps/portal to ${mainProject}...`);
  const localVercel = path.join(portalPath, ".vercel");
  if (fs.existsSync(localVercel)) {
    fs.rmSync(localVercel, { recursive: true, force: true });
  }
  run(`npx vercel link --yes --project ${mainProject}`, portalPath);

  console.log(`4. Deploying Portal to production...`);
  run(`npx vercel deploy --prod --yes`, portalPath);

  console.log(`\nPortal deployed to https://${mainProject}.vercel.app`);
}

main();
