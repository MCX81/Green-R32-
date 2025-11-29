#!/bin/bash
#
# Create admin user in MongoDB Atlas for R32 application
# 
# Usage: ./scripts/create_admin.sh
#

echo ""
echo "============================================================"
echo "🚀 R32 - Create Admin User"
echo "============================================================"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Load environment variables and run script
export $(cat .env | grep -v '^#' | xargs)

# Run the Python script
python3 create_admin_user.py

echo ""
echo "============================================================"
echo "✅ Done! You can now login at:"
echo "   https://r32.ro/admin/login"
echo ""
echo "   Email: admin@r32.ro"
echo "   Password: admin123"
echo "============================================================"
echo ""
