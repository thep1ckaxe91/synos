#!/bin/bash
set -e

echo "🔄 Creating Initial Migration..."

# Change to source directory for migrations
cd /app/source

# Create a new initial migration based on the current model state
echo "🆕 Creating new initial migration..."
dotnet ef migrations add InitialCreate --no-build --verbose

echo "✅ Initial migration created successfully!"
