#!/bin/bash

echo "🔧 Running local development setup..."

# Check if we're in the right directory
if [ ! -f "Synos.Api.csproj" ]; then
    echo "❌ Please run this script from the Synos.Api directory"
    exit 1
fi

# MySQL connection details for local
MYSQL_HOST="localhost"
MYSQL_USER="root"
MYSQL_PASSWORD=""
MYSQL_DATABASE="synos_db"

echo "🔍 Checking local MySQL connection..."
if ! nc -z localhost 3306 2>/dev/null; then
    echo "❌ Cannot connect to local MySQL server. Please start XAMPP MySQL service."
    exit 1
fi

echo "✅ MySQL connection successful!"

# Apply migrations
echo "🔄 Applying database migrations..."
dotnet ef database update

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully!"
    
    # Check if data exists
    MEMBER_COUNT=$(mysql -h $MYSQL_HOST -u $MYSQL_USER $MYSQL_DATABASE -se "SELECT COUNT(*) FROM members;" 2>/dev/null)
    
    if [ "$MEMBER_COUNT" -gt 0 ]; then
        echo "✅ Test data already exists ($MEMBER_COUNT members found)."
    else
        echo "🌱 Seeding local test data..."
        
        # Modify the seed script for local environment
        sed 's/mysql -h mysql -u synos_user -psynos_password synos_db/mysql -h localhost -u root synos_db/g' ../scripts/seed-test-data.sh > temp_local_seed.sh
        
        chmod +x temp_local_seed.sh
        ./temp_local_seed.sh
        rm temp_local_seed.sh
    fi
    
    echo ""
    echo "🚀 Ready to start development!"
    echo "Run: dotnet run --urls \"http://localhost:5000\""
else
    echo "❌ Failed to apply migrations!"
    exit 1
fi