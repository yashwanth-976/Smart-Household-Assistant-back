const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function getGroqChatCompletion(messages) {
    try {
        return await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw error;
    }
}

module.exports = { getGroqChatCompletion };
