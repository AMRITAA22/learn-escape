// Run this script once to fix existing conversations in your database
// Place this file in your backend root directory and run: node fixConversationTitles.js

const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Import your Conversation model
const Conversation = require('./models/Conversation');

const fixConversationTitles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all conversations without proper titles or with "New Chat"
        const conversations = await Conversation.find({
            $or: [
                { title: { $exists: false } },
                { title: 'New Chat' },
                { title: '' }
            ]
        });

        console.log(`Found ${conversations.length} conversations to fix`);

        for (let i = 0; i < conversations.length; i++) {
            const conv = conversations[i];
            console.log(`\nProcessing conversation ${i + 1}/${conversations.length}`);
            console.log(`ID: ${conv._id}`);

            // Get the first user message
            const firstUserMessage = conv.messages.find(msg => msg.role === 'user');
            
            if (!firstUserMessage) {
                console.log('No user messages found, skipping...');
                continue;
            }

            const prompt = firstUserMessage.content;
            console.log(`First message: ${prompt.substring(0, 50)}...`);

            try {
                // Generate title using AI
                const titlePrompt = `Generate a short, descriptive title (maximum 5 words) for a conversation that starts with this question: "${prompt}". Return ONLY the title, no quotes, no extra text.`;
                
                const titleResult = await model.generateContent(titlePrompt);
                const titleResponse = await titleResult.response;
                let title = titleResponse.text().trim();
                
                // Clean up the title
                title = title.replace(/^["']|["']$/g, '').trim();
                title = title.replace(/^Title:\s*/i, '').trim();
                
                // Limit title length
                if (title.length > 50) {
                    title = title.substring(0, 47) + '...';
                }
                
                // Update the conversation
                conv.title = title;
                await conv.save();
                
                console.log(`✓ Updated title to: "${title}"`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error('Error generating title:', error.message);
                // Use fallback title
                const fallbackTitle = prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '');
                conv.title = fallbackTitle;
                await conv.save();
                console.log(`✓ Used fallback title: "${fallbackTitle}"`);
            }
        }

        console.log('\n✅ All conversations updated!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixConversationTitles();