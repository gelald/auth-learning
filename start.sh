#!/bin/bash

# OIDC Demo - 快速启动脚本
# 用法：./start.sh 或 start.bat（Windows）

echo "🚀 Starting OIDC Demo..."
echo ""

# 检查 Docker
echo "📦 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# 启动 Keycloak
echo "🔑 Starting Keycloak..."
cd keycloak
docker-compose up -d
cd ..

echo "⏳ Waiting for Keycloak to be ready (30 seconds)..."
sleep 30

# 检查 Keycloak 状态
if curl -s http://localhost:8080/health/ready > /dev/null; then
    echo "✅ Keycloak is ready"
else
    echo "⚠️  Keycloak might still be starting. Check logs with: docker-compose logs -f"
fi

echo ""
echo "📋 Services Status:"
echo "   - Keycloak:    http://localhost:8080"
echo "   - Frontend:    http://localhost:3000 (run: cd frontend && npm run dev)"
echo "   - Backend:     http://localhost:21301 (run: cd backend && mvn spring-boot:run)"
echo ""
echo "🔐 Test Users:"
echo "   - testuser / testpass (user role)"
echo "   - admin / adminpass (admin role)"
echo ""
echo "✨ Done!"
