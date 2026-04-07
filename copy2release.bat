@echo off
echo Copying build/web-mobile to ../cocos_release/web-mobile ...
xcopy /E /Y /I "build\web-mobile" "..\cocos_release\web-mobile"
echo Done.
pause
