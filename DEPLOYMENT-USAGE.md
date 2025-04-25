# Auto AGI Builder Deployment Usage Guide

This guide explains how to use the deployment toolkit scripts in different environments.

## Available Scripts

The deployment toolkit includes scripts for both Command Prompt and PowerShell:

| Script | Type | Description |
|--------|------|-------------|
| `run-deploy-pipeline.bat` | Batch | For use in Command Prompt |
| `run-deploy-pipeline.ps1` | PowerShell | For use in PowerShell |
| `database-setup.bat` | Batch | Database configuration |
| `storage-setup.bat` | Batch | Storage configuration |
| `auth-setup.bat` | Batch | Authentication configuration |
| `git-commit-and-push.bat` | Batch | Source control operations |

## Running in Command Prompt

When using Command Prompt, you can run batch files directly:

```
run-deploy-pipeline.bat
```

## Running in PowerShell

When using PowerShell, there are two options:

### Option 1: Use the PowerShell Script (Recommended)

The PowerShell script provides color-coded output and better error handling:

```powershell
.\run-deploy-pipeline.ps1
```

### Option 2: Run the Batch File with Explicit Path

PowerShell requires an explicit path when running batch files from the current directory:

```powershell
.\run-deploy-pipeline.bat
```

**Note:** PowerShell does not allow running batch files by name only. You must prefix with `.\` to indicate the current directory.

## Important: File Location and Directory Navigation

Before running any scripts, ensure you are in the directory where the scripts are located. The scripts must be in your current working directory.

1. Open Command Prompt or PowerShell
2. Navigate to the directory containing the scripts:
   ```
   cd path\to\deployment\scripts
   ```
3. Verify the scripts exist in the current directory:
   - Command Prompt: `dir *.bat *.ps1`
   - PowerShell: `Get-ChildItem -Filter *.bat,*.ps1`
4. Then run the appropriate script

## Common Issues

### "Command Not Found" in PowerShell

If you see this error:

```
run-deploy-pipeline.bat : The term 'run-deploy-pipeline.bat' is not recognized as the name of a cmdlet...
```

This could be due to:

1. **File not in current directory**: Ensure you're in the directory containing the scripts
2. **Missing dot-slash prefix**: Use `.\run-deploy-pipeline.bat` instead of just `run-deploy-pipeline.bat`
3. **Script execution policy**: PowerShell security policies may prevent script execution

### PowerShell Execution Policy Restrictions

If PowerShell prevents running scripts with an execution policy error:

```
File cannot be loaded because running scripts is disabled on this system
```

Try one of these solutions:

1. **Temporarily bypass for a single script:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run-deploy-pipeline.ps1
   ```

2. **Change execution policy for the current session:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

3. **Use Command Prompt instead:**
   ```
   run-deploy-pipeline.bat
   ```

### Last Resort: Copy to Desktop

If you're still having issues with paths or execution:

1. Copy the script files to a simple path like your Desktop
2. Open Command Prompt and run:
   ```
   cd %USERPROFILE%\Desktop
   run-deploy-pipeline.bat
   ```

## Deployment Pipeline Steps

Both scripts follow the same workflow:

1. **Environment Configuration**
   - Configure database, storage, and authentication

2. **Build & Deployment Preparation**
   - Prepare application for deployment

3. **Deployment to Vercel**
   - Deploy frontend and/or backend to Vercel

4. **Deployment Verification**
   - Verify the deployment was successful

5. **Source Control**
   - Commit and push changes to Git

## Example Usage

### Complete Deployment Flow

To run the complete deployment pipeline:

1. Open Command Prompt or PowerShell
2. Navigate to your project directory
3. Run the appropriate script:
   - Command Prompt: `run-deploy-pipeline.bat`
   - PowerShell: `.\run-deploy-pipeline.ps1` or `.\run-deploy-pipeline.bat`
4. Follow the interactive prompts

### Individual Configuration Scripts

If you want to run just the configuration steps individually:

- Database: `database-setup.bat` (Command Prompt) or `.\database-setup.bat` (PowerShell)
- Storage: `storage-setup.bat` (Command Prompt) or `.\storage-setup.bat` (PowerShell)
- Authentication: `auth-setup.bat` (Command Prompt) or `.\auth-setup.bat` (PowerShell)

## Requirements

- Windows operating system
- Command Prompt or PowerShell
- Git installed and configured
- Vercel CLI installed (`npm install -g vercel`)
