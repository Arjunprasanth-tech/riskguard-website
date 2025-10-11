// A simple Express.js server to handle API calls securely.

// 1. Import required libraries
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config(); 

// 2. Initialize the Express app
const app = express();
app.use(express.json()); 

// 3. Serve the static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 4. Get your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

// 5. Create the /api/generate endpoint
app.post('/api/generate', async (req, res) => {
    if (!GEMINI_API_KEY) {
        console.error('API key is not configured.');
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        const { userQuery, systemPrompt } = req.body;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ "google_search": {} }],
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("Gemini API Error:", errorText);
            return res.status(apiResponse.status).json({ error: `Gemini API error: ${errorText}` });
        }

        const result = await apiResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        res.status(200).json({ text: text || "No response generated." });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// 6. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


