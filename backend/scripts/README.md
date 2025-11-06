# Synos Backend Scripts

This directory contains various utility scripts for managing the Synos backend application.

## Scripts Overview

### 🐳 Docker Scripts

#### `migrate.sh`
- **Purpose**: Main migration script used by Docker containers
- **Usage**: Automatically run when Docker container starts
- **Features**:
  - Waits for MySQL to be ready
  - Applies database migrations
  - Seeds test data
  - Starts the API application

#### `seed-test-data.sh`
- **Purpose**: Seeds the database with comprehensive test data
- **Usage**: Called automatically by `migrate.sh` or run manually
- **Creates**:
  - 5 Categories (Paintings, Sculptures, Photography, etc.)
  - 5 Members (3 Artists, 2 Buyers)
  - 6 Artworks with images
  - 3 Exhibitions
  - 2 Active auctions
  - Sample orders and favorites
  - 1 Admin account

#### `reset-and-seed.sh`
- **Purpose**: Clears all data and reseeds the database
- **Usage**: `docker exec -it synos_backend /app/scripts/reset-and-seed.sh`
- **Warning**: ⚠️ This will DELETE ALL existing data!

### 💻 Local Development Scripts

#### `setup-local.sh`
- **Purpose**: Sets up local development environment
- **Usage**: Run from `Synos.Api` directory: `../scripts/setup-local.sh`
- **Features**:
  - Applies EF Core migrations
  - Seeds test data if none exists
  - Works with XAMPP MySQL

## Test Data Credentials

After seeding, you can use these accounts for testing:

### 🎨 Artists
```
Email: artist@synos.com
Password: artist123
Role: Artist
```

```
Email: painter@synos.com  
Password: painter123
Role: Artist
```

```
Email: sculptor@synos.com
Password: sculptor123
Role: Artist
```

### 🛒 Buyers
```
Email: buyer@synos.com
Password: buyer123
Role: Buyer
```

```
Email: collector@synos.com
Password: collector123
Role: Buyer
```

### 👑 Admin
```
Email: admin@synos.com
Password: admin123
Role: Admin
```

## Usage Examples

### Docker Environment

```bash
# Start containers (migration runs automatically)
docker-compose up --build

# Reset and reseed data
docker exec -it synos_backend /app/scripts/reset-and-seed.sh

# Manual seeding
docker exec -it synos_backend /app/scripts/seed-test-data.sh
```

### Local Development

```bash
# Setup local environment
cd backend/Synos.Api
../scripts/setup-local.sh

# Start development server
dotnet run --urls "http://localhost:5000"
```

## Database Connection

### Docker
- Host: `mysql` (container-to-container)
- Port: `3306`
- Database: `synos_db`
- User: `synos_user`
- Password: `synos_password`

### Local (XAMPP)
- Host: `localhost`
- Port: `3306` 
- Database: `synos_db`
- User: `root`
- Password: (empty)

## Test Data Structure

The seed script creates a complete marketplace scenario:

- **Categories**: Various art categories for classification
- **Artists**: Seller profiles with bios, websites, and portfolios
- **Buyers**: Collector accounts for purchasing
- **Artworks**: Sample pieces with images, prices, and details
- **Exhibitions**: Gallery shows featuring artworks
- **Auctions**: Active bidding scenarios
- **Orders**: Completed purchase examples
- **Favorites**: User preference data

## Troubleshooting

### MySQL Connection Issues
```bash
# Check if MySQL is running
nc -z localhost 3306  # Local
nc -z mysql 3306      # Docker

# Check Docker container logs
docker logs synos_mysql
docker logs synos_backend
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Data Issues
```bash
# Check data existence
mysql -u root synos_db -e "SELECT COUNT(*) FROM members;"

# Manual cleanup
mysql -u root synos_db -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE members; SET FOREIGN_KEY_CHECKS=1;"
```

## Notes

- All passwords in test data are hashed versions of simple passwords for development only
- Scripts automatically detect Docker vs local environment
- Foreign key constraints are properly handled during data operations
- Scripts include error handling and status reporting