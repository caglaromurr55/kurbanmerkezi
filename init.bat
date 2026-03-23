@echo off
npx -y create-next-app@latest temp-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
xcopy temp-app . /E /H /Y
rmdir /S /Q temp-app
del "%~f0"
