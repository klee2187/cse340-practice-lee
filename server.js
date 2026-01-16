// Imports
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

// Declare Important Variables
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Express Server
const app = express();

//Configure Express middleware


//Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Declare Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/about.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/products.html'));
}); 

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
