import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { init, stream } from 'play.ht';

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Use import.meta.url to get the directory name
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Serve static files from 'public' folder
app.use(express.json());
app.use(express.static('public'));

// Serve the HTML page for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Adjust the path to your HTML file
});

// Initialize PlayHT with your credentials
init({
    userId: 'c3bb0de290d748e6b0d289a9af971779', // Replace with your PlayHT user ID
    apiKey: 'T8ZdHlLnTcWiAvepCD1JxMPtam93', // Replace with your PlayHT API key
});

// Endpoint to convert text to speech
app.post('/convertTextToSpeech', upload.single('file'), async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        // Stream the audio from PlayHT
        const audioStream = await stream(text, { voiceEngine: 'Play3.0-mini' });
        const outputFilePath = path.join(__dirname, 'public', 'output.mp3');

        // Save the stream to a file
        const writeStream = fs.createWriteStream(outputFilePath);
        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            res.json({ audioUrl: '/output.mp3' }); // Return the path to the generated audio file
        });

        writeStream.on('error', (err) => {
            console.error('Error writing audio file:', err);
            res.status(500).json({ error: 'Error processing audio' });
        });
    } catch (error) {
        console.error('Error during text-to-speech conversion:', error);
        res.status(500).json({ error: 'Failed to convert text to speech' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
