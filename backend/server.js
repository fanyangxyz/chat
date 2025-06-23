const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// Store conversation history for each session
const conversations = new Map();

app.post('/chat', async (req, res) => {
    console.log('Received chat request:', req.body);
    try {
        const { message, sessionId = 'default' } = req.body;
        console.log('Processing message:', message);

        // Get or create conversation history for this session
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        const conversation = conversations.get(sessionId);

        // Add user message to conversation history
        conversation.push({ role: "user", content: message });

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: conversation
        });

        // Add assistant response to conversation history
        conversation.push({ role: "assistant", content: response.content[0].text });

        console.log('API response received');
        res.json({ response: response.content[0].text });
    } catch (error) {
        console.error('Error in /chat endpoint:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key configured:', process.env.CLAUDE_API_KEY ? 'Yes' : 'No');
});
