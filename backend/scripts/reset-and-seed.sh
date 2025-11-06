#!/bin/bash

echo "🧹 Cleaning database and reseeding test data..."

# MySQL connection details
MYSQL_HOST="mysql"
MYSQL_USER="synos_user"
MYSQL_PASSWORD="synos_password"
MYSQL_DATABASE="synos_db"

# Check if running in Docker or local
if nc -z mysql 3306 2>/dev/null; then
    echo "🐳 Running in Docker environment"
    HOST="mysql"
elif nc -z localhost 3306 2>/dev/null; then
    echo "💻 Running in local environment"
    HOST="localhost"
else
    echo "❌ Cannot connect to MySQL server"
    exit 1
fi

echo "🗑️ Clearing existing data..."

# Clear data in reverse order to respect foreign key constraints
mysql -h $HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE << 'EOF'

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE commissions;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE favorite;
TRUNCATE TABLE auctions;
TRUNCATE TABLE exhibition_artworks;
TRUNCATE TABLE exhibitions;
TRUNCATE TABLE artwork_images;
TRUNCATE TABLE artworks;
TRUNCATE TABLE sellers;
TRUNCATE TABLE members;
TRUNCATE TABLE admin;
TRUNCATE TABLE categories;

SET FOREIGN_KEY_CHECKS = 1;

EOF

if [ $? -eq 0 ]; then
    echo "✅ Database cleared successfully!"
    
    # Run the seeding script
    echo "🌱 Running seed script..."
    /app/scripts/seed-test-data.sh
else
    echo "❌ Failed to clear database!"
    exit 1
fi