@echo off
echo ===================================
echo AUTO AGI BUILDER GIT OPERATIONS
echo ===================================
echo.

echo This script will help you commit and push changes to Git.
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Git is not installed or not in the PATH.
  echo Please install Git from https://git-scm.com/
  exit /b 1
)

REM Check if current directory is a git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Current directory is not a Git repository.
  echo Please run this script from the project root directory.
  
  set /p INIT_REPO=Would you like to initialize a new repository? (Y/N): 
  if /i "%INIT_REPO%"=="Y" (
    git init
    echo Git repository initialized.
    echo.
  ) else (
    exit /b 1
  )
)

REM Check branch status
echo Checking current branch status...
git status

REM Choose whether to stash changes
echo.
set /p STASH_CHANGES=Do you want to stash any changes before proceeding? (Y/N): 
if /i "%STASH_CHANGES%"=="Y" (
  set /p STASH_MESSAGE=Enter stash message (or press Enter to use default): 
  if "%STASH_MESSAGE%"=="" (
    git stash
  ) else (
    git stash push -m "%STASH_MESSAGE%"
  )
  echo Changes stashed.
  echo.
)

REM Provide branch options
echo.
echo Current branch management:
echo 1. Stay on current branch
echo 2. Create a new branch
echo 3. Switch to an existing branch
echo.

set /p BRANCH_CHOICE=Enter your choice (1-3): 

if "%BRANCH_CHOICE%"=="2" (
  set /p NEW_BRANCH=Enter new branch name: 
  git checkout -b %NEW_BRANCH%
  echo Switched to new branch '%NEW_BRANCH%'
  echo.
) else if "%BRANCH_CHOICE%"=="3" (
  echo Available branches:
  git branch
  echo.
  set /p EXISTING_BRANCH=Enter branch name to switch to: 
  git checkout %EXISTING_BRANCH%
  echo Switched to branch '%EXISTING_BRANCH%'
  echo.
)

REM Get current branch name
for /f "tokens=* USEBACKQ" %%g in (`git branch --show-current`) do (set CURRENT_BRANCH=%%g)
echo Current branch: %CURRENT_BRANCH%
echo.

REM Stage files
echo Staging files for commit...
echo.
echo Select staging option:
echo 1. Stage all files
echo 2. Stage specific files
echo 3. Review files individually
echo.

set /p STAGE_CHOICE=Enter your choice (1-3): 

if "%STAGE_CHOICE%"=="1" (
  git add .
  echo All files staged.
) else if "%STAGE_CHOICE%"=="2" (
  set /p FILES_TO_STAGE=Enter file patterns to stage (space-separated): 
  git add %FILES_TO_STAGE%
  echo Specified files staged.
) else if "%STAGE_CHOICE%"=="3" (
  echo Unstaged changes:
  git status -s
  echo.
  
  REM Loop through unstaged files
  echo Reviewing files individually...
  for /f "tokens=*" %%a in ('git ls-files --modified --others --exclude-standard') do (
    set /p STAGE_FILE=Stage "%%a"? (Y/N): 
    if /i "!STAGE_FILE!"=="Y" (
      git add "%%a"
      echo Added: %%a
    )
  )
)

REM Show staged files
echo.
echo Files staged for commit:
git diff --name-only --cached

REM Create commit
echo.
echo Creating commit...
echo.
echo Select commit type:
echo 1. feat:     New feature
echo 2. fix:      Bug fix
echo 3. docs:     Documentation change
echo 4. style:    Code style/formatting
echo 5. refactor: Code refactoring
echo 6. test:     Adding/updating tests
echo 7. chore:    Build process or tools
echo 8. deploy:   Deployment related changes
echo 9. Other (custom)
echo.

set /p COMMIT_TYPE_CHOICE=Enter your choice (1-9): 

if "%COMMIT_TYPE_CHOICE%"=="1" (
  set COMMIT_PREFIX=feat
) else if "%COMMIT_TYPE_CHOICE%"=="2" (
  set COMMIT_PREFIX=fix
) else if "%COMMIT_TYPE_CHOICE%"=="3" (
  set COMMIT_PREFIX=docs
) else if "%COMMIT_TYPE_CHOICE%"=="4" (
  set COMMIT_PREFIX=style
) else if "%COMMIT_TYPE_CHOICE%"=="5" (
  set COMMIT_PREFIX=refactor
) else if "%COMMIT_TYPE_CHOICE%"=="6" (
  set COMMIT_PREFIX=test
) else if "%COMMIT_TYPE_CHOICE%"=="7" (
  set COMMIT_PREFIX=chore
) else if "%COMMIT_TYPE_CHOICE%"=="8" (
  set COMMIT_PREFIX=deploy
) else (
  set /p COMMIT_PREFIX=Enter custom commit type prefix: 
)

set /p COMMIT_SUBJECT=Enter commit subject: 
set /p COMMIT_BODY=Enter additional commit details (optional, press Enter to skip): 

if "%COMMIT_BODY%"=="" (
  git commit -m "%COMMIT_PREFIX%: %COMMIT_SUBJECT%"
) else (
  echo %COMMIT_PREFIX%: %COMMIT_SUBJECT%> commit_msg.tmp
  echo.>> commit_msg.tmp
  echo %COMMIT_BODY%>> commit_msg.tmp
  git commit -F commit_msg.tmp
  del commit_msg.tmp
)

echo Commit created.

REM Push to remote
echo.
echo Would you like to push your changes to remote?
set /p PUSH_CHANGES=Enter Y to push, any other key to skip: 

if /i "%PUSH_CHANGES%"=="Y" (
  REM Check if remote exists
  git remote -v | find "origin" >nul
  
  if %ERRORLEVEL% NEQ 0 (
    echo No remote repository found.
    set /p ADD_REMOTE=Would you like to add a remote repository? (Y/N): 
    
    if /i "%ADD_REMOTE%"=="Y" (
      set /p REMOTE_URL=Enter the remote repository URL: 
      git remote add origin %REMOTE_URL%
      echo Remote added as 'origin'.
    ) else (
      echo Skipping push as no remote is configured.
      goto end
    )
  )
  
  REM Check if current branch exists on remote
  git ls-remote --heads origin %CURRENT_BRANCH% >nul 2>&1
  
  if %ERRORLEVEL% EQU 0 (
    git push origin %CURRENT_BRANCH%
  ) else (
    echo Branch '%CURRENT_BRANCH%' does not exist on remote.
    set /p SET_UPSTREAM=Would you like to set the upstream branch? (Y/N): 
    
    if /i "%SET_UPSTREAM%"=="Y" (
      git push -u origin %CURRENT_BRANCH%
      echo Branch '%CURRENT_BRANCH%' pushed to remote and upstream set.
    ) else (
      echo Skipping push.
    )
  )
) else (
  echo Skipping push.
)

:end
echo.
echo Git operations completed.
echo.
pause
