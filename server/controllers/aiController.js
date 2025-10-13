const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Conversation = require('../models/Conversation'); 

// Initialize the Google AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// This model name is correct for the latest library version
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// For the latest, most capable model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//lalalalalala finally working
// OR for a faster and more cost-effective option
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });

// In-memory storage for user notes { userId: 'note content' }
const userNotes = {};

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.uploadMiddleware = upload.single('noteFile');

// This function handles uploading and processing notes (text or image)
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

// This function handles the chat logic using the Gemini API
exports.chat = async (req, res) => {
    const userId = req.user.id;
    const { prompt,conversationId  } = req.body;
    const noteContent = userNotes[userId];

    if (!prompt) {
        return res.status(400).json({ message: 'A prompt is required.' });
    }
    try {
        let conversation;
        // Find existing conversation or create a new one
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
        }
        if (!conversation) {
            conversation = new Conversation({ userId: userId, messages: [] });
        }

        // Add the user's new message to the history
        conversation.messages.push({ role: 'user', content: prompt });

        let fullPrompt = prompt;
        if (noteContent) {
            fullPrompt = `Based ONLY on the following notes, answer the question.\n\n---NOTES---\n${noteContent}\n---END NOTES---\n\nQuestion: ${prompt}`;
        }

        // Start a chat session with history for context (optional, but better)
        const chatSession = model.startChat({
            history: conversation.messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
        });

    const result = await chatSession.sendMessage(fullPrompt);
        const response = await result.response;
        const aiResponseText = response.text();

        // Add the AI's response to the history
        conversation.messages.push({ role: 'assistant', content: aiResponseText });
        await conversation.save();

        res.status(200).json({ 
            response: aiResponseText, 
            conversationId: conversation._id // Send back the ID
        });
    } catch (error) {
        console.error("Error communicating with Gemini AI:", error);
        res.status(500).json({ message: "Failed to get a response from the AI." });
    }
};

// Get all of a user's conversations
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).select('title updatedAt');
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversations." });
    }
};
// Get a single conversation's full message history
exports.getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversation." });
    }
};
