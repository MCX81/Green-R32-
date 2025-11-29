#!/bin/bash

# ============================================
# Script Deployment R32 + Facturare
# ============================================

set -e

echo "🚀 R32 + Facturare Deployment Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcții helper
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verifică dacă rulează ca root pentru comenzi specifice
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_info "Running as root"
    else
        print_info "Running as non-root user"
    fi
}

# ============================================
# 1. VERIFICARE MEDIU
# ============================================

echo ""
echo "📋 Step 1: Verificare mediu..."

# Verifică Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js instalat: $NODE_VERSION"
else
    print_error "Node.js nu este instalat!"
    exit 1
fi

# Verifică Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python instalat: $PYTHON_VERSION"
else
    print_error "Python nu este instalat!"
    exit 1
fi

# Verifică MongoDB
if command -v mongod &> /dev/null; then
    print_success "MongoDB instalat"
else
    print_info "MongoDB nu este instalat local (poate fi remote)"
fi

# Verifică Yarn
if command -v yarn &> /dev/null; then
    print_success "Yarn instalat"
else
    print_info "Instalare Yarn..."
    npm install -g yarn
fi

# ============================================
# 2. BACKEND SETUP
# ============================================

echo ""
echo "⚙️  Step 2: Backend Setup..."

cd backend

# Verifică .env
if [ ! -f .env ]; then
    print_error ".env nu există! Creez template..."
    cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=r32_database
JWT_SECRET=change-this-to-a-strong-secret-key-in-production
CORS_ORIGINS=*
RESEND_API_KEY=
EOF
    print_info "Template .env creat. Actualizează valorile pentru production!"
fi

# Instalează dependințe Python
print_info "Instalare dependințe Python..."
pip install -r requirements.txt
print_success "Dependințe Python instalate"

cd ..

# ============================================
# 3. FRONTEND BUILD
# ============================================

echo ""
echo "🎨 Step 3: Frontend Build..."

cd frontend

# Verifică .env
if [ ! -f .env ]; then
    print_error ".env nu există! Creez template..."
    cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
EOF
    print_info "Template .env creat. Actualizează REACT_APP_BACKEND_URL pentru production!"
fi

# Instalează dependințe
print_info "Instalare dependințe frontend..."
yarn install
print_success "Dependințe frontend instalate"

# Build production
print_info "Build production frontend..."
yarn build
print_success "Build production complet"

cd ..

# ============================================
# 4. VERIFICARE BUILD
# ============================================

echo ""
echo "✅ Step 4: Verificare build..."

# Verifică build frontend
if [ -d "frontend/build" ]; then
    BUILD_SIZE=$(du -sh frontend/build | cut -f1)
    print_success "Build frontend generat: $BUILD_SIZE"
else
    print_error "Build frontend nu a fost generat!"
    exit 1
fi

# Verifică backend files
if [ -f "backend/server.py" ]; then
    print_success "Backend server.py existent"
else
    print_error "Backend server.py lipsește!"
    exit 1
fi

# Verifică router facturare
if [ -f "backend/routers/facturare.py" ]; then
    print_success "Router facturare existent"
else
    print_error "Router facturare lipsește!"
    exit 1
fi

# ============================================
# 5. TEST LOCAL (OPTIONAL)
# ============================================

echo ""
echo "🧪 Step 5: Test local..."

read -p "Vrei să rulezi test local? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pornire backend pe localhost:8001..."
    cd backend
    uvicorn server:app --host 0.0.0.0 --port 8001 &
    BACKEND_PID=$!
    cd ..
    
    sleep 3
    
    # Test backend
    if curl -s http://localhost:8001/api/ | grep -q "R32"; then
        print_success "Backend funcționează"
    else
        print_error "Backend nu răspunde"
    fi
    
    # Test frontend build
    cd frontend/build
    python3 -m http.server 3000 &
    FRONTEND_PID=$!
    cd ../..
    
    sleep 2
    
    if curl -s http://localhost:3000 | grep -q "root"; then
        print_success "Frontend servit corect"
    else
        print_error "Frontend nu răspunde"
    fi
    
    print_info "Oprire servere test..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
fi

# ============================================
# 6. DEPLOYMENT OPTIONS
# ============================================

echo ""
echo "🚀 Step 6: Deployment"
echo ""
echo "Alege metoda de deployment:"
echo "1) Vercel (Recomandat pentru început)"
echo "2) Netlify"
echo "3) VPS/Cloud Server"
echo "4) Docker"
echo "5) Skip deployment"
echo ""
read -p "Selectează (1-5): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        print_info "Deployment Vercel..."
        
        # Verifică vercel CLI
        if ! command -v vercel &> /dev/null; then
            print_info "Instalare Vercel CLI..."
            npm install -g vercel
        fi
        
        print_info "Pornire deployment Vercel..."
        print_info "Urmează instrucțiunile din terminal pentru login și configurare"
        vercel --prod
        
        print_success "Deployment Vercel complet!"
        print_info "Configurează domeniul r32.ro în Vercel Dashboard"
        ;;
        
    2)
        echo ""
        print_info "Deployment Netlify..."
        
        # Verifică netlify CLI
        if ! command -v netlify &> /dev/null; then
            print_info "Instalare Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        print_info "Pornire deployment Netlify..."
        netlify deploy --prod --dir=frontend/build
        
        print_success "Deployment Netlify complet!"
        print_info "Configurează domeniul r32.ro în Netlify Dashboard"
        ;;
        
    3)
        echo ""
        print_info "Deployment VPS/Cloud Server..."
        print_info "Consultă documentația din FACTURARE_INTEGRATION.md pentru pașii completi"
        print_info "Ai nevoie de:"
        echo "  - Server cu Ubuntu/Debian"
        echo "  - Nginx instalat"
        echo "  - MongoDB instalat/remote"
        echo "  - SSL certificate (Let's Encrypt)"
        ;;
        
    4)
        echo ""
        print_info "Deployment Docker..."
        print_info "Creez Dockerfile-uri..."
        
        # Backend Dockerfile
        cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Instalează dependințe sistem pentru WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
EOF
        
        # Frontend Dockerfile
        cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
        
        # Docker Compose
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=r32_database
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
EOF
        
        print_success "Dockerfile-uri create!"
        print_info "Rulează: docker-compose up -d"
        ;;
        
    5)
        print_info "Skip deployment"
        ;;
        
    *)
        print_error "Opțiune invalidă"
        ;;
esac

# ============================================
# 7. FINAL CHECKS
# ============================================

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
print_success "Build generat cu succes"
print_info "Verifică FACTURARE_INTEGRATION.md pentru pașii următori"
echo ""
echo "📍 Rute importante:"
echo "   - Homepage R32: /"
echo "   - Facturare: /factura"
echo "   - Admin: /admin"
echo "   - API Docs: /docs"
echo ""
echo "📝 Next Steps:"
echo "   1. Push la GitHub (vezi FACTURARE_INTEGRATION.md)"
echo "   2. Configurează environment variables pentru production"
echo "   3. Configurează domeniul r32.ro"
echo "   4. Setup SSL certificate"
echo "   5. Testează toate funcționalitățile"
echo ""
print_success "Deployment ready! 🚀"
