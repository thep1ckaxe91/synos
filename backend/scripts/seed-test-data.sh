#!/bin/bash

echo "🌱 Starting test data seeding..."

# Wait a moment to ensure database is fully ready
sleep 2

# MySQL connection details
MYSQL_HOST="mysql"
MYSQL_USER="synos_user"
MYSQL_PASSWORD="synos_password"
MYSQL_DATABASE="synos_db"

# Check if data already exists
echo "🔍 Checking if test data already exists..."
MEMBER_COUNT=$(mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -se "SELECT COUNT(*) FROM members;")

if [ "$MEMBER_COUNT" -gt 0 ]; then
    echo "✅ Test data already exists ($MEMBER_COUNT members found). Skipping seeding."
    exit 0
fi

echo "📝 Inserting test data..."

# Create test data SQL
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE << 'EOF'

-- Insert Categories
INSERT INTO categories (id, name, slug, description, created_at) VALUES
(1, 'Paintings', 'paintings', 'Oil paintings, watercolors, and acrylic works', NOW()),
(2, 'Sculptures', 'sculptures', 'Bronze, marble, and modern sculptures', NOW()),
(3, 'Photography', 'photography', 'Digital and film photography art', NOW()),
(4, 'Digital Art', 'digital-art', 'Computer-generated and digital artwork', NOW()),
(5, 'Mixed Media', 'mixed-media', 'Artwork combining multiple mediums', NOW());

-- Insert Members (Sellers and Buyers)
INSERT INTO members (id, email, password_hash, full_name, role, phone, bio, profile_image, created_at, updated_at, is_active) VALUES
(1, 'seller@synos.com', 'rW/e0TSeo9G72zmBnn6PxM301X4mc/gEBNWBK/E1Z6A=', 'Vincent Artist', 'Seller', '+1234567890', 'Professional painter with 15 years of experience in contemporary art. Specializes in abstract expressionism and landscape paintings.', 'profiles/vincent-artist.jpg', NOW(), NOW(), TRUE),
(2, 'buyer@synos.com', 'aCjKtrkbZY9Y0id6FKSHqEWzxheyF1DsuNFfwDJMykA=', 'Art Collector', 'Buyer', '+1987654321', NULL, NULL, NOW(), NOW(), TRUE),
(3, 'painter@synos.com', 'JNcMuPa5ocEP4D2x4HXyG3SX847PmwXYlenrmsLRTs4=', 'Pablo Modern', 'Seller', '+1122334455', 'Modern painter inspired by cubism and surrealism. Creates vibrant works that challenge traditional perspectives.', 'profiles/pablo-modern.jpg', NOW(), NOW(), TRUE),
(4, 'collector@synos.com', '3USK4RgoW7sx+HYOmosZVEue3Go7r+IRA5rkkqyAej4=', 'Gallery Owner', 'Buyer', '+1555666777', NULL, NULL, NOW(), NOW(), TRUE),
(5, 'sculptor@synos.com', 'uPNCg9BNF9bVv3si9eIT0bWd3rrU8uEb46mSshhOZV4=', 'Auguste Stone', 'Seller', '+1999888777', 'Contemporary sculptor working with bronze, marble, and mixed media. Known for large-scale public installations.', 'profiles/auguste-stone.jpg', NOW(), NOW(), TRUE);

-- Insert Artworks
INSERT INTO artworks (id, seller_id, title, description, category_id, creation_year, dimensions, `condition`, is_for, fixed_price, currency, status, created_at, updated_at) VALUES
(1, 1, 'Sunset Over Mountains', 'A breathtaking landscape painting capturing the golden hour over mountain ranges', 1, 2023, '24x36 inches', 'Excellent', 'Fixed', 1200.00, 'USD', 'Available', NOW(), NOW()),
(2, 1, 'Abstract Dreams', 'An abstract expressionist piece exploring the subconscious mind through color and form', 1, 2024, '30x40 inches', 'Mint', 'Auction', NULL, 'USD', 'Available', NOW(), NOW()),
(3, 3, 'Cubist Portrait', 'A modern interpretation of portraiture in the cubist style', 1, 2023, '20x24 inches', 'Excellent', 'Fixed', 800.00, 'USD', 'Available', NOW(), NOW()),
(4, 5, 'Bronze Figure', 'Contemporary bronze sculpture representing human emotion', 2, 2024, '12x8x6 inches', 'Mint', 'Fixed', 2500.00, 'USD', 'Available', NOW(), NOW()),
(5, 1, 'Ocean Waves', 'Dynamic seascape capturing the power and beauty of ocean waves', 1, 2023, '36x48 inches', 'Very Good', 'Auction', NULL, 'USD', 'Available', NOW(), NOW()),
(6, 3, 'Urban Rhythm', 'Modern cityscape with geometric patterns and vibrant colors', 1, 2024, '28x32 inches', 'Excellent', 'Fixed', 950.00, 'USD', 'Available', NOW(), NOW());

-- Insert Artwork Images
INSERT INTO artwork_images (id, artwork_id, file_path, is_primary, uploaded_at) VALUES
(1, 1, 'artworks/sunset-mountains-main.jpg', TRUE, NOW()),
(2, 1, 'artworks/sunset-mountains-detail1.jpg', FALSE, NOW()),
(3, 2, 'artworks/abstract-dreams-main.jpg', TRUE, NOW()),
(4, 3, 'artworks/cubist-portrait-main.jpg', TRUE, NOW()),
(5, 4, 'artworks/bronze-figure-main.jpg', TRUE, NOW()),
(6, 4, 'artworks/bronze-figure-side.jpg', FALSE, NOW()),
(7, 5, 'artworks/ocean-waves-main.jpg', TRUE, NOW()),
(8, 6, 'artworks/urban-rhythm-main.jpg', TRUE, NOW());

-- Insert Exhibitions
INSERT INTO exhibitions (id, title, description, location, start_date, end_date, created_at) VALUES
(1, 'Contemporary Visions 2024', 'A showcase of modern artistic expressions from emerging and established artists', 'Synos Gallery, Downtown', '2024-03-15 10:00:00', '2024-04-15 18:00:00', NOW()),
(2, 'Abstract Expressions', 'Exploring the world of abstract art through various mediums and techniques', 'Modern Art Museum', '2024-05-01 09:00:00', '2024-06-01 17:00:00', NOW()),
(3, 'Sculpture Garden', 'An outdoor exhibition featuring contemporary sculptures and installations', 'City Sculpture Park', '2024-07-01 08:00:00', '2024-09-30 20:00:00', NOW());

-- Insert Exhibition Artworks
INSERT INTO exhibition_artworks (exhibition_id, artwork_id, display_from, display_to) VALUES
(1, 1, '2024-03-15 10:00:00', '2024-04-15 18:00:00'),
(1, 3, '2024-03-15 10:00:00', '2024-04-15 18:00:00'),
(1, 6, '2024-03-15 10:00:00', '2024-04-15 18:00:00'),
(2, 2, '2024-05-01 09:00:00', '2024-06-01 17:00:00'),
(2, 5, '2024-05-01 09:00:00', '2024-06-01 17:00:00'),
(3, 4, '2024-07-01 08:00:00', '2024-09-30 20:00:00');

-- Insert Auctions
INSERT INTO auctions (id, artwork_id, start_time, end_time, starting_price, reserve_price, minimum_increment, status, created_at) VALUES
(1, 2, '2024-12-01 10:00:00', '2024-12-15 18:00:00', 500.00, 800.00, 50.00, 'Active', NOW()),
(2, 5, '2024-12-10 14:00:00', '2024-12-20 20:00:00', 750.00, 1000.00, 75.00, 'Active', NOW());

-- Insert Favorites
INSERT INTO favorite (artworks_id, user_id, created_at) VALUES
(1, 2, NOW()),
(3, 2, NOW()),
(4, 2, NOW()),
(1, 4, NOW()),
(2, 4, NOW()),
(6, 4, NOW());

-- Insert Orders
INSERT INTO orders (id, user_id, order_number, total_amount, currency, payment_type, payment_time, status, created_at, updated_at) VALUES
(1, 2, 'ORD-2024-001', 1200.00, 'USD', 'Credit Card', NOW(), 'Paid', NOW(), NOW()),
(2, 4, 'ORD-2024-002', 2500.00, 'USD', 'Bank Transfer', NOW(), 'Paid', NOW(), NOW());

-- Insert Order Items
INSERT INTO order_items (id, order_id, artwork_id, total) VALUES
(1, 1, 1, 1200.00),
(2, 2, 4, 2500.00);

-- Insert Commissions
INSERT INTO commissions (id, artwork_id, commission_type, value, applied_at) VALUES
(1, 1, 'Percentage', 0.1000, NOW()),
(2, 4, 'Percentage', 0.1500, NOW());

-- Insert Admin
INSERT INTO admin (id, email, password_hash, full_name, phone, created_at, updated_at, is_active) VALUES
(1, 'admin@synos.com', 'L+yBlDsdu+tOyWx7++adN7HYhny5FVntuaYIHvj6TfU=', 'System Administrator', '+1000000000', NOW(), NOW(), TRUE);

EOF

if [ $? -eq 0 ]; then
    echo "✅ Test data seeded successfully!"
    echo "📊 Summary:"
    echo "   - 5 Categories created"
    echo "   - 5 Members created (3 Sellers, 2 Buyers)"
    echo "   - 6 Artworks created"
    echo "   - 8 Artwork images created"
    echo "   - 3 Exhibitions created"
    echo "   - 6 Exhibition-artwork relationships created"
    echo "   - 2 Auctions created"
    echo "   - 6 Favorites created"
    echo "   - 2 Orders with items created"
    echo "   - 2 Commissions created"
    echo "   - 1 Admin created"
    echo ""
    echo "🔑 Test Login Credentials:"
    echo "   Seller: seller@synos.com / seller123"
    echo "   Buyer: buyer@synos.com / buyer123"
    echo "   Admin: admin@synos.com / admin123"
else
    echo "❌ Failed to seed test data!"
    exit 1
fi