// Script to fix the invalid route pattern in vercel.json
const fs = require('fs');

console.log('Fixing invalid route pattern in vercel.json...');

// Read the current vercel.json file
let vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

// Find the problematic redirect (the one with http://:host(.+))
if (vercelConfig.redirects) {
  // Fix the invalid host pattern in the redirect
  vercelConfig.redirects = vercelConfig.redirects.map(redirect => {
    if (redirect.source === "http://:host(.+)") {
      console.log('Found invalid redirect source pattern: "http://:host(.+)"');
      // Replace with a valid pattern
      return {
        ...redirect,
        source: "/(.*)",
        destination: "https://www.autoagibuilder.app/$1",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http"
          }
        ]
      };
    }
    return redirect;
  });

  // Write the fixed vercel.json file
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('Successfully fixed vercel.json!');
} else {
  console.log('No redirects found in vercel.json');
}
