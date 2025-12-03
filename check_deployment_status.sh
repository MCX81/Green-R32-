#!/bin/bash

# Script pentru verificarea status-ului deployment și domeniu
# Rulează: bash /app/check_deployment_status.sh

echo "=================================================="
echo "🔍 R32 DEPLOYMENT STATUS CHECK"
echo "=================================================="
echo ""

# Job ID
echo "📋 Job Info:"
echo "   Current Job ID: 925efaca-123e-4c7d-b0da-5249a1d93ac6"
echo "   Created at: $(cat /app/.emergent/emergent.yml | grep created_at | cut -d'"' -f4)"
echo ""

# Check services
echo "🔧 Service Status:"
sudo supervisorctl status | grep -E "(frontend|backend|mongodb)"
echo ""

# Check if build exists
echo "📦 Frontend Build:"
if [ -d "/app/frontend/build" ]; then
    BUILD_HASH=$(ls /app/frontend/build/static/js/main.*.js 2>/dev/null | head -1 | grep -o 'main\.[^.]*\.js')
    if [ ! -z "$BUILD_HASH" ]; then
        echo "   ✅ Build exists: $BUILD_HASH"
        echo "   📅 Build date: $(stat -c %y /app/frontend/build/static/js/main.*.js | cut -d'.' -f1)"
    else
        echo "   ❌ No build files found"
    fi
else
    echo "   ❌ Build directory not found"
fi
echo ""

# Check domain status
echo "🌐 Domain Check (r32.ro):"
echo "   Testing connection..."
DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://r32.ro 2>/dev/null)
if [ "$DOMAIN_STATUS" = "200" ]; then
    echo "   ✅ Domain is accessible (HTTP $DOMAIN_STATUS)"
else
    echo "   ⚠️  Domain returned HTTP $DOMAIN_STATUS"
fi

# Check what version is live
echo ""
echo "   Checking live version..."
LIVE_HASH=$(curl -s https://r32.ro/ 2>/dev/null | grep -o 'static/js/main\.[^"]*\.js' | head -1 | grep -o 'main\.[^"]*\.js')
if [ ! -z "$LIVE_HASH" ]; then
    echo "   🌍 Live version: $LIVE_HASH"
    
    # Compare with local build
    if [ ! -z "$BUILD_HASH" ]; then
        if [ "$BUILD_HASH" = "$LIVE_HASH" ]; then
            echo "   ✅ Local build matches live version"
        else
            echo "   ⚠️  Local build ($BUILD_HASH) differs from live ($LIVE_HASH)"
            echo "   👉 You need to DEPLOY to publish your changes!"
        fi
    fi
else
    echo "   ❌ Could not fetch live version"
fi
echo ""

# Check API endpoints
echo "🔌 Backend API Check:"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://r32.ro/api/admin/setup-admin 2>/dev/null)
if [ "$API_STATUS" = "200" ]; then
    echo "   ✅ Backend API is accessible (HTTP $API_STATUS)"
else
    echo "   ⚠️  Backend API returned HTTP $API_STATUS"
fi
echo ""

# Check admin login page
echo "👤 Admin Login Check:"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://r32.ro/admin/login 2>/dev/null)
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "   ✅ Admin login page is accessible (HTTP $ADMIN_STATUS)"
else
    echo "   ⚠️  Admin login page returned HTTP $ADMIN_STATUS"
fi
echo ""

# Check facturare
echo "📄 Facturare Check:"
FACTURA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://r32.ro/factura 2>/dev/null)
if [ "$FACTURA_STATUS" = "200" ]; then
    echo "   ✅ Facturare page is accessible (HTTP $FACTURA_STATUS)"
else
    echo "   ⚠️  Facturare page returned HTTP $FACTURA_STATUS"
fi
echo ""

# Environment check
echo "🔑 Environment Variables:"
if [ -f "/app/frontend/.env.production" ]; then
    echo "   ✅ Frontend .env.production exists"
    grep "REACT_APP_BACKEND_URL" /app/frontend/.env.production | head -1
else
    echo "   ❌ Frontend .env.production not found"
fi

if [ -f "/app/backend/.env" ]; then
    echo "   ✅ Backend .env exists"
    grep "MONGO_URL" /app/backend/.env | head -1 | cut -c1-40
else
    echo "   ❌ Backend .env not found"
fi
echo ""

echo "=================================================="
echo "📝 Summary:"
echo "=================================================="
if [ "$DOMAIN_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    echo "✅ Basic checks passed"
    if [ "$BUILD_HASH" != "$LIVE_HASH" ]; then
        echo "⚠️  BUT: Your local changes are NOT deployed yet"
        echo ""
        echo "🚀 NEXT STEPS:"
        echo "   1. Follow /app/DOMAIN_FORK_WORKFLOW.md"
        echo "   2. Unlink domain from old fork (if needed)"
        echo "   3. Deploy this fork"
        echo "   4. Link domain to this fork"
        echo "   5. Wait 5-15 minutes for DNS"
        echo "   6. Run this script again to verify"
    else
        echo "✅ Everything looks good!"
        echo "   You can test your application at: https://r32.ro"
    fi
else
    echo "❌ Some issues detected"
    echo ""
    echo "📖 TROUBLESHOOTING:"
    echo "   1. Check /app/DOMAIN_FORK_WORKFLOW.md"
    echo "   2. Verify domain is linked to THIS fork"
    echo "   3. Check service logs:"
    echo "      tail -n 50 /var/log/supervisor/frontend.err.log"
    echo "      tail -n 50 /var/log/supervisor/backend.err.log"
fi
echo "=================================================="
