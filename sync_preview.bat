@echo off

echo ============================================
echo [1/4] Git pull ..\h5-game
echo ============================================
pushd "..\h5-game"
if %errorlevel% neq 0 (
    echo ERROR: ..\h5-game not found
    pause
    exit /b 1
)
git fetch --all
git reset --hard origin/master
echo.

echo ============================================
echo [2/4] Build h5-game
echo ============================================
call pnpm build
if %errorlevel% neq 0 (
    echo ERROR: pnpm build failed
    popd
    pause
    exit /b 1
)
popd
echo.

echo ============================================
echo [3/4] Copy dist to build-templates\web-mobile\
echo ============================================
xcopy /E /Y /Q "..\h5-game\dist\*" "build-templates\web-mobile\"
if %errorlevel% neq 0 (
    echo ERROR: copy failed, check ..\h5-game\dist\
    pause
    exit /b 1
)
echo.

echo ============================================
echo [4/4] Run sync:template
echo ============================================
call npm run sync:template
echo.

echo ============================================
echo All done!
echo ============================================
pause
