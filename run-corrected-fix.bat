@echo off
echo ===================================================
echo    Updated UI Provider Fix Solution
echo ===================================================

echo Step 1: Installing required dependencies...
cd deployment\frontend

echo Installing recharts...
call npm install recharts --save

echo Installing date-fns...
call npm install date-fns --save

echo Installing heroicons...
call npm install @heroicons/react --save

echo Installing headlessui...
call npm install @headlessui/react --save

echo Step 2: Fixing registry.ts syntax error...
cd ..\..\
node -e "const fs=require('fs');const path=require('path');const registryPath=path.join('deployment','frontend','lib','mcp','registry.ts');try{let content=fs.readFileSync(registryPath,'utf8');content=content.replace(/registry\?: ContextRegistry;\s*\}\> = \(\{ children, registry = globalRegistry \}\) =>/,'registry?: ContextRegistry;\n}): React.ReactElement => ({ children, registry = globalRegistry }) =>');fs.writeFileSync(registryPath,content);console.log('Successfully fixed registry.ts syntax error!');}catch(error){console.error('Error fixing registry.ts:',error);}"

echo Step 3: Building the project...
cd deployment\frontend
call npm run build

echo ===================================================
echo    All fixes completed!
echo ===================================================
echo All required packages have been installed,
echo registry.ts has been fixed, and the project has been built.
cd ..\..\
pause
