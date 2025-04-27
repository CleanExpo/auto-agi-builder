#!/usr/bin/env node

/**
 * This script creates a .env.local file from the .env.template
 * and prompts the user to enter the values for each variable.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const templatePath = path.join(__dirname, 'frontend', '.env.template');
const outputPath = path.join(__dirname, 'frontend', '.env.local');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createEnvFile() {
  console.log('\n=== Creating .env.local file for Vercel deployment ===\n');
  
  try {
    // Read the template file
    if (!fs.existsSync(templatePath)) {
      console.error(`Error: Template file not found at ${templatePath}`);
      process.exit(1);
    }
    
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Parse variables from template
    const variables = [];
    const lines = template.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim() === '') continue;
      
      const match = line.match(/^([A-Za-z0-9_]+)=/);
      if (match) {
        variables.push(match[1]);
      }
    }
    
    // Prompt for values
    const values = {};
    
    console.log('Please enter values for the following environment variables:');
    console.log('(Press Enter to skip or use default values)\n');
    
    for (const variable of variables) {
      const value = await prompt(`${variable}: `);
      values[variable] = value;
    }
    
    // Generate new .env.local file
    let output = '';
    
    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim() === '') {
        output += line + '\n';
        continue;
      }
      
      const match = line.match(/^([A-Za-z0-9_]+)=/);
      if (match) {
        const variable = match[1];
        if (values[variable]) {
          output += `${variable}="${values[variable]}"\n`;
        } else {
          output += line + '\n';
        }
      } else {
        output += line + '\n';
      }
    }
    
    // Write the output file
    fs.writeFileSync(outputPath, output);
    
    console.log(`\nSuccess! .env.local file created at: ${outputPath}`);
    console.log('Use these same values in your Vercel project environment variables.');
    
  } catch (error) {
    console.error('Error creating .env.local file:', error);
  } finally {
    rl.close();
  }
}

createEnvFile();
