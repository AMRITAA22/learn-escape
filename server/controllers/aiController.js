const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Conversation = require('../models/Conversation');
const FlashcardDeck = require('../models/FlashcardDeck');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const userNotes = {};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.uploadMiddleware = upload.single('noteFile');

exports.uploadNotes = async (req, res) => {
    const userId = req.user.id;
    const noteFile = req.file;

    if (!noteFile) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        let noteContent = '';
        if (noteFile.mimetype.startsWith('image/')) {
            const { data: { text } } = await Tesseract.recognize(noteFile.buffer, 'eng');
            noteContent = text;
        } else {
            noteContent = noteFile.buffer.toString('utf-8');
        }

        userNotes[userId] = noteContent;
        res.status(200).json({ message: 'Notes processed successfully. You can now ask questions.' });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: "Failed to process the uploaded file." });
    }
};

exports.chat = async (req, res) => {
    const userId = req.user.id;
    const { prompt, conversationId } = req.body;
    const noteContent = userNotes[userId];

    if (!prompt) {
        return res.status(400).json({ message: 'A prompt is required.' });
    }
    try {
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
        }
        if (!conversation) {
            conversation = new Conversation({ userId: userId, messages: [] });
        }

        conversation.messages.push({ role: 'user', content: prompt });

        let fullPrompt = prompt;
        if (noteContent) {
            fullPrompt = `Based ONLY on the following notes, answer the question.\n\n---NOTES---\n${noteContent}\n---END NOTES---\n\nQuestion: ${prompt}`;
        }

        const chatSession = model.startChat({
            history: conversation.messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
        });

        const result = await chatSession.sendMessage(fullPrompt);
        const response = await result.response;
        const aiResponseText = response.text();

        conversation.messages.push({ role: 'assistant', content: aiResponseText });
        await conversation.save();

        res.status(200).json({ 
            response: aiResponseText, 
            conversationId: conversation._id
        });
    } catch (error) {
        console.error("Error communicating with Gemini AI:", error);
        res.status(500).json({ message: "Failed to get a response from the AI." });
    }
};

// NEW: Generate flashcards from notes or custom topic
exports.generateFlashcards = async (req, res) => {
    const userId = req.user.id;
    const { topic, numberOfCards, useUploadedNotes } = req.body;

    if (!topic && !useUploadedNotes) {
        return res.status(400).json({ message: 'Please provide a topic or use uploaded notes.' });
    }

    const cardCount = numberOfCards || 10;

    try {
        let promptContent = '';
        
        if (useUploadedNotes && userNotes[userId]) {
            promptContent = `Based on the following notes, generate ${cardCount} flashcards for studying:\n\n${userNotes[userId]}`;
        } else if (topic) {
            promptContent = `Generate ${cardCount} educational flashcards about: ${topic}`;
        } else {
            return res.status(400).json({ message: 'No notes uploaded. Please upload notes first or provide a topic.' });
        }

        const fullPrompt = `${promptContent}

Format your response as a JSON array with this exact structure:
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]

Make the flashcards educational, clear, and focused on key concepts. Return ONLY the JSON array, no additional text.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let aiResponseText = response.text();

        // Clean up the response to extract JSON
        aiResponseText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const flashcards = JSON.parse(aiResponseText);

        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error('Invalid flashcard format received from AI');
        }

        res.status(200).json({ 
            flashcards,
            message: `Generated ${flashcards.length} flashcards successfully!`
        });
    } catch (error) {
        console.error("Error generating flashcards:", error);
        res.status(500).json({ message: "Failed to generate flashcards. Please try again." });
    }
};

// NEW: Generate and save flashcards directly to a deck
exports.generateAndSaveDeck = async (req, res) => {
    const userId = req.user.id;
    const { topic, numberOfCards, useUploadedNotes, deckTitle, deckDescription } = req.body;

    if (!topic && !useUploadedNotes) {
        return res.status(400).json({ message: 'Please provide a topic or use uploaded notes.' });
    }

    const cardCount = numberOfCards || 10;

    try {
        let promptContent = '';
        
        if (useUploadedNotes && userNotes[userId]) {
            promptContent = `Based on the following notes, generate ${cardCount} flashcards for studying:\n\n${userNotes[userId]}`;
        } else if (topic) {
            promptContent = `Generate ${cardCount} educational flashcards about: ${topic}`;
        } else {
            return res.status(400).json({ message: 'No notes uploaded. Please upload notes first or provide a topic.' });
        }

        const fullPrompt = `${promptContent}

Format your response as a JSON array with this exact structure:
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]

Make the flashcards educational, clear, and focused on key concepts. Return ONLY the JSON array, no additional text.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let aiResponseText = response.text();

        aiResponseText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const flashcards = JSON.parse(aiResponseText);

        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error('Invalid flashcard format received from AI');
        }

        // Create a new deck with the generated flashcards
        const title = deckTitle || `AI Generated: ${topic || 'From Notes'}`;
        const description = deckDescription || `Generated ${flashcards.length} flashcards using AI`;

        const newDeck = await FlashcardDeck.create({
            title,
            description,
            createdBy: userId,
            cards: flashcards,
        });

        res.status(201).json({ 
            deck: newDeck,
            message: `Created deck with ${flashcards.length} AI-generated flashcards!`
        });
    } catch (error) {
        console.error("Error generating and saving deck:", error);
        res.status(500).json({ message: "Failed to generate and save flashcards. Please try again." });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .select('title updatedAt');
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversations." });
    }
};

exports.getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversation." });
    }
};