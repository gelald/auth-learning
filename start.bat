@echo off
REM OIDC Demo - Windows Quick Start Script
REM Usage: start.bat

echo.
echo 🚀 Starting OIDC Demo...
echo.

REM Check Docker
echo 📦 Checking Docker...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Start Keycloak
echo 🔑 Starting Keycloak...
cd keycloak
docker-compose up -d
cd ..

echo.
echo ⏳ Waiting for Keycloak to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check Keycloak status
curl -s http://localhost:8080/health/ready >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Keycloak is ready
) else (
    echo ⚠️  Keycloak might still be starting. Check logs with: docker-compose logs -f
)

echo.
echo 📋 Services Status:
echo    - Keycloak:    http://localhost:8080
echo    - Frontend:    http://localhost:3000 ^(run: cd frontend ^&^& npm run dev^)
echo    - Backend:     http://localhost:21301 ^(run: cd backend ^&^& mvn spring-boot:run^)
echo.
echo 🔐 Test Users:
echo    - testuser / testpass ^(user role^)
echo    - admin / adminpass ^(admin role^)
echo.
echo ✨ Done!
pause
