#!/bin/bash
set -e

echo "🔄 Starting migration process (fresh start)..."

# Wait for MySQL to be ready
until nc -z mysql 3306; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 2
done

echo "✅ MySQL is ready!"

# Change to source directory for migrations
cd /app/source

# Drop the database to ensure a clean slate. Force the drop and ignore errors if it doesn't exist.
echo "💣 Dropping existing database (if any)..."
dotnet ef database drop --force --no-build || echo "Database could not be dropped (it may not have existed)."

# Create a new initial migration based on the current model state
echo "🆕 Creating new initial migration..."
dotnet ef migrations add InitialCreate --no-build --verbose

# Apply the new migration to the database
echo "Applying new migration..."
dotnet ef database update --verbose

echo "✅ Database created and migrated successfully!"

# Verify tables were created
echo "🔍 Verifying tables were created..."
mysql -h mysql -u synos_user -psynos_password synos_db -e "SHOW TABLES;" || echo "Could not verify tables"

# Run test data seeding
echo "🌱 Seeding test data..."
/app/scripts/seed-test-data.sh

# Start the application
echo "🚀 Starting Synos API..."
cd /app
exec dotnet Synos.Api.dll