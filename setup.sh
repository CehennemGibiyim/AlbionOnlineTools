#!/bin/bash

# Albion Tools — Setup Script for Linux/macOS
# This script sets up the Albion Tools environment and runs the application

set -e

echo "================================"
echo "🎮 Albion Tools — Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js
echo -n "Checking Node.js... "
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ ${NODE_VERSION}${NC}"

# Check npm
echo -n "Checking npm... "
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ ${NPM_VERSION}${NC}"

# Create data directory
echo -n "Creating data directory... "
mkdir -p data
echo -e "${GREEN}✓${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Build database
echo ""
echo "Building item database..."
npm run build-db

# Ask user for mode
echo ""
echo "Choose running mode:"
echo "1) Web Server (http://localhost:3000)"
echo "2) Docker (Recommended for production)"
echo "3) Exit"
echo ""
read -p "Enter choice [1-3]: " CHOICE

case $CHOICE in
    1)
        echo ""
        echo -e "${GREEN}Starting Web Server...${NC}"
        npm run web
        ;;
    2)
        echo ""
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}✗ Docker not found. Please install Docker${NC}"
            exit 1
        fi
        echo -e "${GREEN}Building Docker image...${NC}"
        docker build -t albion-tools:latest .
        echo -e "${GREEN}Starting container...${NC}"
        docker run -p 3000:3000 -v $(pwd)/data:/app/data albion-tools:latest
        ;;
    3)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
