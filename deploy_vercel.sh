#!/bin/bash

# Environment Variables
export DATABASE_URL="postgresql://neondb_owner:npg_Fy0dIAcRH7En@ep-restless-frog-b1gwgznn-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export PUTER_AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYyIn0.eyJ0IjoidCIsInYiOiIyIiwidG9rZW5fdWlkIjoiMWEyY2Y5OTgtNTk2Mi00YjZmLWJkOTctMGQzNmZiMTFmYzQxIiwidXUiOiJuZkpLNzhVbVNiMm1sTGJIbG84ZHd3PT0iLCJzdSI6IjhHeHlWY3hVUXl1Sm5LbXRONjUvTkE9PSIsImFpIjoibmZKSzc4VW1TYjJtbExiSGxvOGR3dz09IiwiZnVsbF9hY2Nlc3MiOnRydWUsImlhdCI6MTc5MTI1MDA2MH0.jzyssf5RtXBzzN_fl9JnNCaEMUARIV3ofJlSvvcCj1k"
export MONGODB_URI="mongodb+srv://kahloutbus0_db_user:pAUjwIyy0spOMwET@learningsysos.sguqvcs.mongodb.net/?appName=learningsysos&compressors=zlib"
export PUTER_MODEL_NAME="deepseek/deepseek-v4-pro"
export AUTH_SECRET="a_very_secure_random_string_for_auth_secret_12345"

# Define projects
cd /Users/ismail/Downloads/learning_systems/learning-systems-hub/apps

for dir in */; do
    app_name="${dir%/}"
    echo "Deploying $app_name..."
    cd "$app_name"
    
    # Deploy to create the project (non-interactive, confirm all defaults)
    npx -y vercel --yes --prod --name "lsh-$app_name" --token "$VERCEL_TOKEN"
    
    # Add environment variables based on .env.example
    if [ -f ".env.example" ]; then
        if grep -q "DATABASE_URL" ".env.example"; then
            echo -n "$DATABASE_URL" | npx -y vercel env add DATABASE_URL production --yes
        fi
        if grep -q "PUTER_AUTH_TOKEN" ".env.example"; then
            echo -n "$PUTER_AUTH_TOKEN" | npx -y vercel env add PUTER_AUTH_TOKEN production --yes
        fi
        if grep -q "PUTER_MODEL_NAME" ".env.example"; then
            echo -n "$PUTER_MODEL_NAME" | npx -y vercel env add PUTER_MODEL_NAME production --yes
        fi
        if grep -q "MONGODB_URI" ".env.example"; then
            echo -n "$MONGODB_URI" | npx -y vercel env add MONGODB_URI production --yes
        fi
        if grep -q "AUTH_SECRET" ".env.example"; then
            echo -n "$AUTH_SECRET" | npx -y vercel env add AUTH_SECRET production --yes
        fi
    fi
    
    # Redeploy with env vars
    npx -y vercel --yes --prod
    
    cd ..
done
