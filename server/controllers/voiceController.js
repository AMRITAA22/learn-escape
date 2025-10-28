const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/task');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// System prompt for task extraction
const getSystemPrompt = () => {
    const today = new Date();
    return `You are an expert task parsing engine. Extract tasks from natural language commands.
Output must be valid JSON.

CONTEXT: Current date is ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

Handle time references:
- "today" = ${today.toISOString().split('T')[0]}
- "tomorrow" = ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}
- "next week" = add 7 days
- Specific times: "at 5pm", "by 3:30", etc.

Output format:
{
    "intent": "add_task" | "query_task" | "update_task" | "remove_task",
    "tasks": [
        {
            "title": "Task description",
            "dueDate": "YYYY-MM-DD" or null,
            "completed": false
        }
    ]
}

Examples:
- "Add buy groceries tomorrow" → {"intent": "add_task", "tasks": [{"title": "Buy groceries", "dueDate": "2025-10-29", "completed": false}]}
- "Remind me to call mom at 5pm today" → {"intent": "add_task", "tasks": [{"title": "Call mom", "dueDate": "2025-10-28", "completed": false}]}
- "Add meeting on Friday and submit report by Monday" → Multiple tasks

Return ONLY the JSON object, no additional text.`;
};

// Initialize model with system prompt
const getModel = () => {
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        systemInstruction: getSystemPrompt()
    });
};

// @desc    Process voice command and extract tasks
// @route   POST /api/voice/process
exports.processVoiceCommand = async (req, res) => {
    const { transcription } = req.body;

    if (!transcription) {
        return res.status(400).json({ message: 'Transcription is required' });
    }

    try {
        const model = getModel();
        const result = await model.generateContent(transcription);
        const responseText = result.response.text().trim();
        
        // Clean up JSON response
        const cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsedData = JSON.parse(cleanedResponse);
        const intent = parsedData.intent;

        let responseMessage = '';
        let createdTasks = [];

        // Handle different intents
        switch (intent) {
            case 'add_task':
                const tasksToAdd = parsedData.tasks || [];
                
                if (tasksToAdd.length === 0) {
                    return res.status(400).json({ 
                        message: 'Could not extract task details',
                        intent 
                    });
                }

                // Create tasks in database
                for (const taskData of tasksToAdd) {
                    const newTask = await Task.create({
                        title: taskData.title,
                        dueDate: taskData.dueDate || null,
                        completed: false,
                        createdBy: req.user.id
                    });
                    createdTasks.push(newTask);
                }

                const taskDescriptions = createdTasks.map(t => `"${t.title}"`).join(' and ');
                responseMessage = `Successfully added ${createdTasks.length} task${createdTasks.length > 1 ? 's' : ''}: ${taskDescriptions}`;

                return res.status(201).json({
                    message: responseMessage,
                    intent,
                    tasks: createdTasks
                });

            case 'query_task':
                // Query existing tasks
                const allTasks = await Task.find({ createdBy: req.user.id })
                    .sort({ dueDate: 1, createdAt: -1 });
                
                responseMessage = `You have ${allTasks.length} task${allTasks.length !== 1 ? 's' : ''} in your list.`;
                
                return res.status(200).json({
                    message: responseMessage,
                    intent,
                    tasks: allTasks
                });

            case 'update_task':
            case 'remove_task':
                // These would need more sophisticated matching logic
                return res.status(200).json({
                    message: 'Task update/removal features coming soon',
                    intent,
                    parsedData
                });

            default:
                return res.status(200).json({
                    message: 'Command understood but not yet implemented',
                    intent,
                    parsedData
                });
        }

    } catch (error) {
        console.error('Voice processing error:', error);
        
        if (error instanceof SyntaxError) {
            return res.status(500).json({ 
                message: 'Failed to parse AI response',
                error: error.message 
            });
        }

        return res.status(500).json({ 
            message: 'Failed to process voice command',
            error: error.message 
        });
    }
};

// @desc    Health check for voice service
// @route   GET /api/voice/health
exports.checkVoiceService = async (req, res) => {
    try {
        // Test if Gemini API is accessible
        const model = getModel();
        const testResult = await model.generateContent('Test connection');
        
        res.status(200).json({
            status: 'healthy',
            message: 'Voice service is operational',
            geminiConnected: true
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Voice service unavailable',
            error: error.message
        });
    }
};
