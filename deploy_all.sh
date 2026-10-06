#!/bin/bash
set -e

echo "Generating generic secrets..."
export AUTH_SECRET=$(openssl rand -base64 32)
export DATABASE_URL="postgresql://neondb_owner:npg_Fy0dIAcRH7En@ep-restless-frog-b1gwgznn-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export PUTER_AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYyIn0.eyJ0IjoidCIsInYiOiIyIiwidG9rZW5fdWlkIjoiMWEyY2Y5OTgtNTk2Mi00YjZmLWJkOTctMGQzNmZiMTFmYzQxIiwidXUiOiJuZkpLNzhVbVNiMm1sTGJIbG84ZHd3PT0iLCJzdSI6IjhHeHlWY3hVUXl1Sm5LbXRONjUvTkE9PSIsImFpIjoibmZKSzc4VW1TYjJtbExiSGxvOGR3dz09IiwiZnVsbF9hY2Nlc3MiOnRydWUsImlhdCI6MTc5MTI1MDA2MH0.jzyssf5RtXBzzN_fl9JnNCaEMUARIV3ofJlSvvcCj1k"
export MONGODB_URI="mongodb+srv://kahloutbus0_db_user:pAUjwIyy0spOMwET@learningsysos.sguqvcs.mongodb.net/?appName=learningsysos&compressors=zlib"
export PUTER_MODEL_NAME="deepseek/deepseek-v4-pro"

# To collect portal URLs
declare -A APP_URLS
cd /Users/ismail/Downloads/learning_systems/learning-systems-hub/apps

echo "Starting automated deployment..."
for dir in */; do
    app_name="${dir%/}"
    if [ "$app_name" = "portal" ]; then
        continue
    fi
    
    echo "==================================="
    echo "Deploying $app_name..."
    cd "$app_name"
    
    # 1. Link project and create it if it doesn't exist
    npx -y vercel link --yes --project "lsh-$app_name"
    
    # 2. Set Env variables automatically
    echo -n "$DATABASE_URL" | npx -y vercel env add DATABASE_URL production --yes || true
    echo -n "$PUTER_AUTH_TOKEN" | npx -y vercel env add PUTER_AUTH_TOKEN production --yes || true
    echo -n "$PUTER_MODEL_NAME" | npx -y vercel env add PUTER_MODEL_NAME production --yes || true
    echo -n "$MONGODB_URI" | npx -y vercel env add MONGODB_URI production --yes || true
    echo -n "$AUTH_SECRET" | npx -y vercel env add AUTH_SECRET production --yes || true

    # 3. Deploy to production
    DEPLOY_URL=$(npx -y vercel deploy --prod --yes)
    
    echo "$app_name deployed at $DEPLOY_URL"
    # Format environment variable name properly (e.g. NEXT_PUBLIC_IHLS_URL)
    ENV_VAR_NAME="NEXT_PUBLIC_${app_name^^}_URL"
    ENV_VAR_NAME=${ENV_VAR_NAME//-/_}
    
    APP_URLS["$ENV_VAR_NAME"]="$DEPLOY_URL"
    
    cd ..
done

echo "==================================="
echo "Deploying Portal..."
cd portal
npx -y vercel link --yes --project "lsh-portal"

# Add all generated URLs to portal
for env_name in "${!APP_URLS[@]}"; do
    url="${APP_URLS[$env_name]}"
    echo "Adding $env_name=$url to Portal"
    echo -n "$url" | npx -y vercel env add "$env_name" production --yes || true
done

# Deploy Portal
PORTAL_URL=$(npx -y vercel deploy --prod --yes)

echo "ALL PROJECTS DEPLOYED SUCCESSFULLY!"
echo "Portal URL: $PORTAL_URL"
