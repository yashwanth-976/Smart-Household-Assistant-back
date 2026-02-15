const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getGroqChatCompletion } = require('./groqClient');
const { formatRecipeResponse } = require('./recipeFormatter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Smart Expiry AI Backend is running 🚀');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, inventory, language } = req.body;

        // Default to English if not provided or unknown
        const langMap = {
            'en': 'English',
            'te': 'Telugu',
            'hi': 'Hindi'
        };
        const targetLang = langMap[language] || 'English';

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Construct System Prompt
        const inventoryList = inventory && inventory.length > 0
            ? inventory.map(i => `- ${i.name} (${i.quantity} ${i.unit})`).join('\n')
            : "No items in inventory.";

        const systemPrompt = `
You are a friendly, helpful, and funny cooking assistant. 
Your goal is to help the user cook something using their CURRENT INVENTORY.
Ignore items that are clearly not food-related if any exist.

USER INVENTORY:
${inventoryList}

STRICT LANGUAGE RULE:
You must respond in **${targetLang}**.
If the user speaks in another language, politely switch to ${targetLang} or answer in ${targetLang}.

RULES:
1. Suggest recipes that PRIMARILY use the user's inventory.
2. If they lack ingredients, clearly mention what is missing but suggest alternatives if possible.
3. Be human! Use emojis naturally. Make small jokes.
4. Do NOT be robotic. Do NOT give a standard textbook recipe format unless asked. 
5. If the quantity is low (e.g., 50g rice), warn them nicely.
6. Keep responses concise (under 200 words) unless they ask for a full detailed recipe.
7. If the user input is not about cooking, politely guide them back to cooking.

Formatting:
- Use bold for ingredient names.
- Use bullet points for steps.
    `;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];

        const chatCompletion = await getGroqChatCompletion(messages);
        const aiResponseRaw = chatCompletion.choices[0]?.message?.content || "Oops, I blanked out. Try again?";

        // Format response
        const formattedResponse = formatRecipeResponse(aiResponseRaw);

        res.json({ reply: formattedResponse });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

