#!/bin/bash
export DATABASE_URL="postgresql://neondb_owner:npg_Fy0dIAcRH7En@ep-restless-frog-b1gwgznn-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
cd /Users/ismail/Downloads/learning_systems/learning-systems-hub
for app_dir in apps/*; do
  if [ -f "$app_dir/drizzle.config.ts" ]; then
    echo "Pushing schema for $app_dir..."
    cd "$app_dir"
    npx --yes drizzle-kit push
    cd ../..
  fi
done
echo "All schemas pushed successfully!"
