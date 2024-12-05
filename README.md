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
- Socket.IO/Pusher client for real-time features

### Backend
- Node.js/Express
- PostgreSQL with pgvector
- Socket.IO/Pusher for real-time collaboration
- Gemini/Jina AI for embeddings
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

<img width="1437" alt="Calendar" src="https://github.com/user-attachments/assets/2ff8942a-52a9-42ab-bc30-f3feda3c56c7">


## 🖥️ Interface Preview

### Navigation
  - Quick create button for events/tasks
  - Dashboard access for overview and insights
  - Calendar main view
  - AI assistance feature
  - Friends management
  - Settings configuration
  - User profile section

### Header Controls
- Month/Year display with navigation arrows
- View toggles (Day/Week/Month)
- Quick jump to "Today"
- Calendar selection dropdown
- Quick create event button

### Main Calendar View
- Monthly grid layout with week/day headers
- Event display with time and title
- Task indicators with completion status
- Color-coded events for different calendars/types
- Overflow indicators for busy days (+x)
- Interactive day cells for event creation

### Mini Calendar
- Compact month view for quick navigation
- Date selection highlighting
- Month navigation controls
- Current date indicator
- Week numbers reference

### Right Sidebar 
- **Calendar Types**
  - Personal calendar toggle
  - Tasks visibility control
  - Birthdays calendar
  - Family events
  - Additional calendar integration

- **Group Management**
  - Server-based group calendars
  - Other calendar connections
  
- **Task Management**
  - Upcoming tasks view
  - Task completion tracking
  - Due date display
  - Task filtering options

### AI Assistant
<img width="1438" alt="Ai" src="https://github.com/user-attachments/assets/5845369c-a6cc-42d7-ab6d-2ada50f818b8">


Our AI assistant provides:
- Smart event creation suggestions
- Schedule checking and optimization
- Personalized scheduling recommendations

### Dashboard Analytics
<img width="1437" alt="Dashboard" src="https://github.com/user-attachments/assets/5139baa3-293a-4de8-82f6-1bb527f6e173">


The dashboard offers:
- Weekly/Monthly/Yearly task completion tracking
- AI-powered productivity insights
- Visual completion rate metrics
- Upcoming task management
- Daily task distribution overview

### Friend System
<img width="1438" alt="Friend" src="https://github.com/user-attachments/assets/14bcc32a-d2c2-4c10-af5e-5e87306eb183">


The friends system includes:
- Simple friend addition by username
- Friend search functionality
- Inbox for collaboration requests
- Can view friends calendar

### Theme Example
<img width="1440" alt="Theme" src="https://github.com/user-attachments/assets/cee0eb1c-c1e3-42f3-8279-cf8a3dbb022c">


Additional features:
- Customizable themes
- Seamless dark/light mode switching
- Gradient color options



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
