#!/bin/bash

# Production Setup Script for South Ring Autos
# This script helps set up the production environment

set -e

echo "========================================="
echo "South Ring Autos - Production Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "Application directory: $APP_DIR"
echo ""

cd "$APP_DIR"

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}Existing .env backed up${NC}"
fi

# Create .env from template
if [ ! -f ".env.example" ]; then
    echo -e "${RED}Error: .env.example not found${NC}"
    exit 1
fi

cp .env.example .env
echo -e "${GREEN}Created .env from template${NC}"

# Update production settings
echo ""
echo "Configuring production settings..."
echo ""

# Database settings
sed -i 's/^APP_ENV=.*/APP_ENV=production/' .env
sed -i 's/^DEBUG_MODE=.*/DEBUG_MODE=false/' .env
sed -i 's/^DB_NAME=.*/DB_NAME=zhpebukm_southringautos/' .env
sed -i 's/^DB_USER=.*/DB_USER=zhpebukm_southringautos/' .env
sed -i 's/^DB_PASS=.*/DB_PASS=southringautos@2025/' .env

# Email settings
sed -i 's/^SMTP_HOST=.*/SMTP_HOST=mail.okjtech.co.ke/' .env
sed -i 's/^SMTP_PORT=.*/SMTP_PORT=465/' .env
sed -i 's/^SMTP_USER=.*/SMTP_USER=southring@okjtech.co.ke/' .env
sed -i 's/^SMTP_PASS=.*/SMTP_PASS=southringautos@2025/' .env
sed -i 's/^SMTP_ENCRYPTION=.*/SMTP_ENCRYPTION=ssl/' .env
sed -i 's/^EMAIL_FROM=.*/EMAIL_FROM=southring@okjtech.co.ke/' .env
sed -i 's/^ADMIN_EMAIL=.*/ADMIN_EMAIL=southring@okjtech.co.ke/' .env
sed -i 's|^BASE_URL=.*|BASE_URL=https://okjtech.co.ke/apps/SouthRingAutos|' .env

echo -e "${GREEN}Production settings configured${NC}"

# Set file permissions
echo ""
echo "Setting file permissions..."
chmod 600 .env
chmod -R 755 storage/
chmod -R 755 logs/

echo -e "${GREEN}File permissions set${NC}"

# Install dependencies
echo ""
echo "Installing Composer dependencies..."
if [ -f "composer.json" ]; then
    composer install --no-dev --optimize-autoloader
    echo -e "${GREEN}Dependencies installed${NC}"
else
    echo -e "${YELLOW}Warning: composer.json not found${NC}"
fi

# Create storage directories
echo ""
echo "Creating storage directories..."
mkdir -p storage/logs
mkdir -p storage/uploads
mkdir -p storage/cache
chmod -R 755 storage/

echo -e "${GREEN}Storage directories created${NC}"

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify .env file settings"
echo "2. Run database migrations: php vendor/bin/phinx migrate -e production"
echo "3. Test database connection"
echo "4. Test email sending"
echo "5. Verify file permissions"
echo ""
echo "Important: Review the .env file and update any settings as needed."
echo ""

