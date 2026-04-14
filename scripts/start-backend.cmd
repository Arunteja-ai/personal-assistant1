@echo off
setlocal

cd /d C:\personalassistant\backend

set NODE_ENV=development
set PORT=5000
set CLIENT_URL=http://127.0.0.1:5000
set CLIENT_URLS=http://127.0.0.1:5000,http://localhost:5000
set MONGO_URI=mongodb://127.0.0.1:27017/personal-assistant
set JWT_SECRET=local-dev-super-secret-key
set JWT_EXPIRES_IN=15m
set REFRESH_TOKEN_EXPIRES_IN_DAYS=14
set COOKIE_SECURE=false

C:\Progra~1\nodejs\node.exe src\server.js 1> C:\personalassistant\.runtime\backend.out.log 2> C:\personalassistant\.runtime\backend.err.log
