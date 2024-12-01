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


## ✨ Special Thanks

We would like to express our heartfelt gratitude to the following individuals who contributed to making Calcoy a reality:

### Core Team
- **Nam Ton**
  - Team Lead & Project Manager
  - Technical Product Owner
  - Lead UI/UX Developer
  - Primary architect of the application's core functionality
  - Implemented major calendar features and interface enhancements

- **Justin Chong**
  - DevOps Lead
  - Backend Development
  - AI Integration
  - Deployment Management

- **Toan Tran**
  - AI User Interface Design
  - AI Integration and Implementation
  - User Experience Enhancement

- **Mina Hanna**
  - Backend Development
  - Deployment Management
  - System Architecture

- **Seore Adisa**
  - Frontend Development
  - Project Spokesperson
  - User Interface Contributions

- **Miles Shinmachi**
  - UI Component Development

### Faculty Advisor
We extend our deepest appreciation to **Dr. Fahd Albinali** for his invaluable guidance, constructive feedback, and continuous motivation throughout the development of this project. His mentorship was instrumental in pushing us to exceed our initial goals and create a more refined and powerful application.

### Final Note
To my amazing team - thank you for your dedication, hard work, and the incredible journey we've shared together. Each of you brought unique strengths and perspectives that made this project special. I truly appreciate all the late nights, problem-solving sessions, and moments of celebration we've shared. It has been an honor working alongside such talented individuals, and I sincerely hope our paths cross again in the future. The memories we've created and the bonds we've formed during this project will always be cherished. Wishing each of you the very best in your future endeavors - may your careers be as bright as the dedication you've shown here.

\- Nam Ton