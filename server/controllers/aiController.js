const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Conversation = require('../models/Conversation');
const FlashcardDeck = require('../models/FlashcardDeck');
const Quiz = require('../models/Quiz');

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
        let isNewConversation = false;

        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
        }
        
        if (!conversation) {
            conversation = new Conversation({ 
                userId: userId, 
                messages: [],
                title: 'New Chat' // Set default title
            });
            isNewConversation = true;
            console.log('Created new conversation');
        }

        // Add the user's new message to the history
        conversation.messages.push({ role: 'user', content: prompt });

        let fullPrompt = prompt;
        if (noteContent) {
            fullPrompt = `You are a helpful study assistant. Based on the following notes, provide a detailed and comprehensive answer to the question. Include explanations, examples, and context where relevant.

---NOTES---
${noteContent}
---END NOTES---

Question: ${prompt}

Please provide a thorough explanation.`;
        } else {
            fullPrompt = `You are a helpful study assistant. Provide a detailed and comprehensive answer to the following question. Include explanations, examples, and context where relevant.

Question: ${prompt}`;
        }

        // Start a chat session with history for context
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

        // Auto-generate title if this is a new conversation
        if (isNewConversation) {
            console.log('Generating title for new conversation...');
            console.log('First prompt:', prompt);
            
            try {
                const titlePrompt = `Generate a short, descriptive title (maximum 5 words) for a conversation that starts with this question: "${prompt}". Return ONLY the title, no quotes, no extra text.`;
                
                const titleResult = await model.generateContent(titlePrompt);
                const titleResponse = await titleResult.response;
                let title = titleResponse.text().trim();
                
                console.log('Raw AI title response:', title);
                
                // Clean up the title
                title = title.replace(/^["']|["']$/g, '').trim();
                title = title.replace(/^Title:\s*/i, '').trim();
                
                // Limit title length
                if (title.length > 50) {
                    title = title.substring(0, 47) + '...';
                }
                
                conversation.title = title || prompt.substring(0, 40);
                console.log('Final title set to:', conversation.title);
                
            } catch (titleError) {
                console.error('Error generating title:', titleError);
                // Fallback: use first few words of the prompt
                const fallbackTitle = prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '');
                conversation.title = fallbackTitle;
                console.log('Using fallback title:', conversation.title);
            }
        }

        await conversation.save();
        console.log('Conversation saved with ID:', conversation._id, 'Title:', conversation.title);

        res.status(200).json({ 
            response: aiResponseText, 
            conversationId: conversation._id,
            title: conversation.title
        });
    } catch (error) {
        console.error("Error communicating with Gemini AI:", error);
        res.status(500).json({ message: "Failed to get a response from the AI." });
    }
};

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
        
        console.log('Fetched conversations count:', conversations.length);
        console.log('Conversation titles:', conversations.map(c => ({ id: c._id, title: c.title })));
        
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
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
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: "Failed to fetch conversation." });
    }
};
// server/controllers/aiController.js

// @desc    Generate and save a quiz from a topic
// @route   POST /api/ai/generate-quiz-topic
exports.generateQuizByTopic = async (req, res) => {
    const userId = req.user.id;
    const { topic, numberOfQuestions, title, studyGroupId } = req.body;

    if (!topic) {
        return res.status(400).json({ message: 'A topic is required.' });
    }

    const qCount = numberOfQuestions || 10;
    const quizTitle = title || `AI Quiz: ${topic}`;

    try {
        // --- THIS IS THE UPDATED PROMPT ---
        const fullPrompt = `Generate a ${qCount}-question multiple-choice quiz about: ${topic}.
Format your response as a JSON array with this exact structure:
[
  {
    "questionText": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": "Paris"
  }
]
The 'options' array should contain 4 plain text answers, WITHOUT prefixes like "A)", "B)", etc.
The 'correctAnswer' field MUST be an exact string match to one of the values in the 'options' array.
Return ONLY the JSON array, no additional text.`;
        // --- END OF UPDATED PROMPT ---

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let aiResponseText = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const questions = JSON.parse(aiResponseText);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Invalid quiz format received from AI');
        }

        // Save the new quiz
        const newQuiz = await Quiz.create({
            title: quizTitle,
            questions: questions,
            createdBy: userId,
            resourceType: 'topic',
            studyGroupId: studyGroupId || null // Link to group if ID is provided
        });

        res.status(201).json({ 
            quiz: newQuiz,
            message: `Successfully created quiz "${quizTitle}"!`
        });

    } catch (error) {
        console.error("Error generating quiz from topic:", error);
        res.status(500).json({ message: "Failed to generate quiz. Please try again." });
    }
};