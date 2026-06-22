@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist ".env" (
    echo [setup] Tao .env tu .env.example
    copy /Y ".env.example" ".env" >nul
)

if /I "%~1"=="dev" goto dev
if /I "%~1"=="docker" goto docker
if /I "%~1"=="stop" goto stop
if /I "%~1"=="logs" goto logs

echo NutriWallet runner
echo.
echo   run.cmd docker   Chay toan bo bang Docker
echo   run.cmd dev      MySQL bang Docker, backend/frontend chay local
echo   run.cmd stop     Dung cac container
echo   run.cmd logs     Xem log cac container
exit /b 0

:docker
docker image inspect nutriwallet/backend:local >nul 2>&1
if errorlevel 1 set "NEED_BUILD=1"
docker image inspect nutriwallet/frontend:local >nul 2>&1
if errorlevel 1 set "NEED_BUILD=1"

if defined NEED_BUILD (
    echo [docker] Chua co image local, dang build lan dau...
    docker compose up -d --build
) else (
    echo [docker] Dang khoi dong cac container...
    docker compose up -d
)
if errorlevel 1 exit /b 1
goto urls

:dev
for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"

echo [dev] Dang khoi dong MySQL va phpMyAdmin...
docker compose up -d mysql phpmyadmin
if errorlevel 1 exit /b 1

echo [dev] Dang mo backend va frontend trong hai cua so CMD...
start "NutriWallet Backend" cmd /k "cd /d ""%~dp0nutriwallet_backend"" && mvnw.cmd spring-boot:run"
start "NutriWallet Frontend" cmd /k "cd /d ""%~dp0nutriwallet_frontend"" && if not exist node_modules npm ci && npm run dev"
goto urls

:stop
docker compose down
exit /b %errorlevel%

:logs
docker compose logs -f
exit /b %errorlevel%

:urls
echo.
echo Frontend:   http://localhost:5173
echo Backend:    http://localhost:8082
echo Swagger:    http://localhost:8082/swagger-ui/index.html
echo phpMyAdmin: http://localhost:8081
exit /b 0
