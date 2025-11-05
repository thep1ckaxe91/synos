#!/bin/bash

echo "🔄 Starting migration process..."

# Wait for MySQL to be ready
until nc -z mysql 3306; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 2
done

echo "✅ MySQL is ready!"

# Change to source directory for migrations
cd /app/source

# Check if migrations exist and apply them, or create new ones if needed
echo "🔍 Checking existing migrations..."
if [ -d "Migrations" ] && [ "$(ls -A Migrations)" ]; then
    echo "✅ Migrations found, applying them..."
    dotnet ef database update --no-build --verbose
else
    echo "🆕 No migrations found, creating fresh migration..."
    dotnet ef migrations add InitialCreate --no-build --verbose
    if [ $? -eq 0 ]; then
        echo "✅ Migration created successfully!"
        dotnet ef database update --no-build --verbose
    else
        echo "❌ Failed to create migration!"
        exit 1
    fi
fi
if [ $? -eq 0 ]; then
    echo "✅ Database and tables created successfully!"
else
    echo "❌ Failed to apply migrations!"
    exit 1
fi

# Verify tables were created
echo "🔍 Verifying tables were created..."
mysql -h mysql -u synos_user -psynos_password synos_db -e "SHOW TABLES;" || echo "Could not verify tables"

# Start the application
echo "🚀 Starting Synos API..."
cd /app
exec dotnet Synos.Api.dll