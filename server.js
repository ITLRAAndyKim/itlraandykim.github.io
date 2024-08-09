const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set up a stream source using FFmpeg
const ffmpeg = spawn('ffmpeg', [
  '-f', 'dshow', // Input format for Windows
  '-i', 'video="Integrated Webcam"', // Replace with your actual webcam name
  '-f', 'mjpeg', // Output format
  '-'
]);

// Broadcast the video stream to clients
io.on('connection', (socket) => {
    console.log('A user connected');

    ffmpeg.stdout.on('data', (data) => {
        socket.emit('video', data.toString('base64')); // Encode to base64 for transmission
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
