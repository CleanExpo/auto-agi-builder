# Fixing "Couldn't parse JSON file" Error in Vercel Deployments

This document provides solutions for the "Error: Couldn't parse JSON file" issue that occurs during deployment with Vercel.

## Common Causes of This Error

The JSON parsing error in `vercel.json` typically happens due to:

1. **Invalid JSON Syntax**: Missing commas, extra commas, or unclosed brackets
2. **Improper Escaping**: Especially with backslashes in regex patterns
3. **Special Characters**: Unicode characters or control characters that break JSON parsing
4. **Duplicate Keys**: Having the same key multiple times in an object
5. **Trailing Commas**: Trailing commas after the last element in arrays or objects

## Quick Fix

Run the included `json-validator.bat` script to:
1. Create a clean, properly formatted vercel.json file
2. Validate the syntax using Node.js
3. Replace your existing vercel.json with the validated version

```
./json-validator.bat
```

## Manual Fix Steps

If you prefer to fix the issue manually:

1. Open `vercel.json` in a code editor with JSON validation
2. Check for these common issues:
   - Ensure all quotes are properly closed
   - Verify all brackets and braces have matching pairs
   - Double escape backslashes in regex patterns (e.g., use `\\\.` instead of `\.`)
   - Remove any trailing commas
   - Validate using a JSON linter

3. Create a minimal working version:

```json
{
  "version": 2,
  "name": "auto-agi-builder",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/out",
  "framework": "nextjs"
}
```

4. Gradually add back complex configurations, validating after each addition

## Escaping Regular Expressions in vercel.json

The most common cause of this error is improper escaping of backslashes in regular expressions.

**Incorrect:**
```json
{
  "source": "/(.*)\.(js|css|webp|jpg|jpeg|png|svg|ico)$"
}
```

**Correct:**
```json
{
  "source": "/(.*)\\.(js|css|webp|jpg|jpeg|png|svg|ico)$"
}
```

Note the double backslash (`\\.`) in the correct version. In JSON, backslashes must be escaped with another backslash.

## Using Our Automated Fix Tools

For comprehensive deployment support, we've created:

1. **json-validator.bat**: Quick fix for JSON syntax issues
2. **fix-vercel-config.bat**: More comprehensive configuration repair
3. **run-deploy-pipeline.bat**: Complete deployment pipeline for staging → canary → production

## Preventing This Issue in the Future

1. Use a JSON validator before committing changes to vercel.json
2. Add pre-commit hooks to validate JSON syntax
3. Use an IDE with JSON syntax highlighting and validation
4. Consider generating vercel.json programmatically instead of manual editing
5. Test configuration locally with `vercel --local` before deploying

## Related Vercel Documentation

- [Vercel Configuration Documentation](https://vercel.com/docs/concepts/projects/project-configuration)
- [Vercel Error Codes](https://vercel.com/docs/errors)
- [Vercel JSON Schema](https://vercel.com/docs/api#api-basics/json-schema)
