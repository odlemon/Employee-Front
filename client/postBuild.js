import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths for index.html and the new 404.html file
const indexFilePath = path.join(__dirname, 'dist', 'index.html'); // Vite outputs to 'dist' by default
const errorFilePath = path.join(__dirname, 'dist', '404.html');

// Read content from index.html
fs.readFile(indexFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the index.html file:', err);
    return;
  }

  // Write content to the new 404.html file
  fs.writeFile(errorFilePath, data, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the 404.html file:', err);
      return;
    }
    console.log('404.html created successfully!');
  });
});
