# Calcoy

Calcoy is an intelligent calendar application that combines AI-powered scheduling, real-time collaboration, and extensive customization features to revolutionize how you manage your time.

## ✨ Key Features

### 🤖 AI-Powered Assistance
- Smart schedule optimization and recommendations
- AI-driven insights based on usage patterns

### 👥 Collaboration
- Real-time calendar sharing
- Group calendar creation and management
- Shared event planning and coordination

### 🎨 Customization
- Extensive color theming options with gradient support
- Dark and light mode
- Profile personalization
- Task and event organization

### 📱 Interface Features
- Intuitive sidebar navigation
- Task and event differentiation
- Quick-add event functionality
- Multi-view calendar (Day, Week, Month)
- Collapsible sections for better organization

## 🚀 Getting Started

### Frontend Setup
1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Backend Setup
1. Install necessary packages:
```bash
npm install
```

2. Configure Environment Variables:
- Create a `.env` file in the root directory of backend (timewise/backend/)
- Required variables:
  - `DATABASE_URL`: PostgreSQL connection URL
  - `JWT_SECRET`: Set to "my_key"
  - `GEMINI_API_KEY`: For chatbot functionality
  - `GROQ_API_KEY`: For additional AI features
  - `JINA_API_KEY`: For embedding model

3. PostgreSQL Setup:
- Install and configure PostgreSQL
- Create a database
- Install pgvector extension (follow instructions at https://github.com/pgvector/pgvector)
- Update DATABASE_URL in .env to match your configuration

4. Run the server:
```bash
node index.js
```

## 💻 Tech Stack

### Frontend
- React/Next.js
- OAuth for authentication
- Tailwind CSS for styling
- Socket.IO client for real-time features

### Backend
- Node.js/Express
- PostgreSQL with pgvector
- Socket.IO for real-time collaboration
- Jina AI for embeddings
- Gemini/Groq for AI features

## 🔗 Links
- Website: [calcoy.com](https://calcoy.com)

## 🎯 Core Principles
- Intuitive user experience
- Seamless collaboration
- Smart automation
- Customizable workflow
- Privacy-focused design

## 🛠️ Development Status
Active development - Features being implemented:
- Enhanced AI recommendations
- Additional customization options
- Extended collaboration features
- Performance optimizations
