# 🎓 LearnEscape - Your Ultimate Study Companion

LearnEscape is a comprehensive study management platform designed to help students organize their learning journey. With features like note-taking, flashcards, task management, Pomodoro timer, AI assistance, and collaborative study groups, LearnEscape is your all-in-one productivity tool.

## ✨ Features

### 📝 **Smart Note-Taking**
- Rich text editor with formatting support (bold, italic, headings, lists, code blocks)
- Auto-save functionality
- Search and filter notes
- Export notes as PDF with proper formatting
- Share notes with study groups
- Read-only access for shared notes

### 🗂️ **Flashcard System**
- Create custom flashcard decks
- Add, edit, and delete cards
- Practice mode with card flipping
- Share flashcard decks with study groups
- Track your learning progress

### ✅ **Task Management**
- Create and organize tasks
- Set due dates with visual indicators
- Mark tasks as complete
- Overdue and today's task highlights
- Clean, intuitive interface

### ⏱️ **Pomodoro Timer**
- Focus sessions with customizable duration
- Break time management
- Session tracking
- Audio notifications

### 🤖 **AI Assistant**
- Get instant help with your studies
- Ask questions about any topic
- Smart responses powered by AI
- Context-aware assistance

### 👥 **Study Groups**
- Create private study groups with unique codes
- Invite members using group codes
- Collaborative goal setting
- Share notes and flashcards
- Real-time group chat
- Track group progress
- Admin controls (create, manage, delete)

### 🏆 **Achievements System**
- Unlock achievements as you study
- Track your progress
- Gamified learning experience
- View your achievement collection

### 📊 **Analytics & Export**
- Export notes as PDF
- Export all notes in one PDF
- Generate statistics reports
- Track study metrics

### 🎨 **Study Rooms**
- Virtual study environments
- Different room themes
- Background music/sounds
- Customizable atmosphere

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Quill** for rich text editing
- **Lucide React** for icons
- **jsPDF** for PDF generation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/AMRITAA22/learn-escape
cd learnescape
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```


### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```


4. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

## 📁 Project Structure
```
learnescape/
├── client/                # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service files
│   │   ├── context/      # React Context (Auth)
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main app component
│   │   └── index.tsx     # Entry point
│   └── package.json
│
├── server/               # Backend Node.js application
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Server entry point
│   └── package.json
│
└── README.md
```

## 🔐 Authentication

LearnEscape uses JWT (JSON Web Tokens) for secure authentication:

1. **Register**: Create an account with email and password
2. **Login**: Get a JWT token
3. **Protected Routes**: Token required for all API calls
4. **Auto-logout**: Token expires after 30 days

## 📡 API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Notes Routes
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Flashcards Routes
- `GET /api/flashcards` - Get all decks
- `GET /api/flashcards/:id` - Get single deck
- `POST /api/flashcards` - Create deck
- `PUT /api/flashcards/:id` - Update deck
- `DELETE /api/flashcards/:id` - Delete deck
- `POST /api/flashcards/:id/cards` - Add card to deck
- `PUT /api/flashcards/:deckId/cards/:cardId` - Update card
- `DELETE /api/flashcards/:deckId/cards/:cardId` - Delete card

### Tasks Routes
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Study Groups Routes
- `GET /api/study-groups` - Get user's groups
- `GET /api/study-groups/:id` - Get group details
- `POST /api/study-groups` - Create group
- `POST /api/study-groups/join` - Join group with code
- `DELETE /api/study-groups/:id` - Delete group
- `DELETE /api/study-groups/:id/leave` - Leave group
- `POST /api/study-groups/:id/goals` - Add goal
- `PUT /api/study-groups/:id/goals/:goalId` - Update goal
- `DELETE /api/study-groups/:id/goals/:goalId` - Delete goal
- `POST /api/study-groups/:id/resources` - Share resource
- `POST /api/study-groups/:id/chat` - Send message

## 🎯 Key Features Explained

### Study Groups
Study groups allow collaborative learning:
1. Create a private group with an auto-generated 6-character code
2. Share the code with friends
3. Members can share notes and flashcards
4. Real-time chat functionality
5. Collaborative goal setting and tracking
6. View shared resources in read-only mode

### Note Sharing
- Notes can be shared within study groups
- Shared notes are read-only for group members
- Rich text formatting is preserved
- Export notes as PDF with formatting intact

### Export Features
- **Export Current Note**: Download active note as formatted PDF
- **Export All Notes**: Combine all notes into one PDF document
- **Export Statistics**: Generate analytics report with metrics

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
# Set NODE_ENV=production in .env
npm start
```

## 🌐 Deployment

### Deploy Backend (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Push to Heroku:
```bash
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🐛 Known Issues

- PDF export may not perfectly preserve all rich text formatting
- Real-time chat requires page refresh to see new messages
- Large note exports may take time to generate

## 🔮 Future Enhancements

- [ ] Real-time collaboration on notes
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] File attachments in notes
- [ ] Voice notes
- [ ] Dark mode
- [ ] Spaced repetition algorithm for flashcards


## 👨‍💻 Authors

- **Amrita** - *Initial work* - [AMRITAA22](https://github.com/AMRITAA22)

---
