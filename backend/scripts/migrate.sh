#!/bin/bash
set -e

echo "🔄 Starting migration process..."

# Wait for MySQL to be ready
until nc -z mysql 3306; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 2
done

echo "✅ MySQL is ready!"

# Change to source directory for migrations
cd /app/source

# Apply any pending migrations
echo "Applying database migrations..."
dotnet ef database update --no-build

echo "✅ Database migrations applied successfully!"

# Run test data seeding
echo "🌱 Seeding test data..."
/app/scripts/seed-test-data.sh

# Start the application
echo "🚀 Starting Synos API..."
cd /app
exec dotnet Synos.Api.dll
