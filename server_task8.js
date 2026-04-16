const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    console.log(`[Task 8 Server] Requested URL: ${req.url}`);

    // Default to index.html if root is requested
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Create absolute path to public directory
    let extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    let fullPath = path.join(__dirname, 'public', filePath);

    // Read and serve the file
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Task 8 Server (No Express) running at http://localhost:${PORT}`);
});
