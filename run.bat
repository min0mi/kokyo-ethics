@echo off
chcp 65001 > nul
title 公共倫理パーフェクトマスター.com
echo ========================================================
echo   公共倫理パーフェクトマスター.com を起動しています...
echo   ブラウザで http://localhost:3000 を開きます。
echo ========================================================

set "PATH=C:\Program Files\nodejs;C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd;%PATH%"

start http://localhost:3000
"C:\Program Files\nodejs\npm.cmd" run start
pause
