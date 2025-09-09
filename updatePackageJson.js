const fs = require('fs');
const dotenv = require('dotenv');

// Load the .env file
dotenv.config();

// Get the value of the `HOMEPAGE` variable from .env
const homepageValue = process.env.REACT_APP_BASEPACKAGEJOSN_URL;

if (!homepageValue) {
    console.error('Error: HOMEPAGE is not defined in the .env file.');
    process.exit(1);
}

// Read the package.json file
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Update the `homepage` field in package.json
packageJson.homepage = homepageValue;

// Write the updated package.json back to the file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Updated homepage in package.json to: ${homepageValue}`);
