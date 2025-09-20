# ChatGPT Clone

A beautiful ChatGPT-like interface built with Next.js, featuring a clean white background with light orange accents and black fonts.

## Features

- 🎨 ChatGPT-like UI with white background and light orange theme
- 💬 Real-time chat interface
- 📱 Responsive design
- 🗃️ Chat history storage with Supabase
- 🤖 AI integration with Groq API
- 🔍 Skill Gap Analysis with web search and YouTube recommendations
- 🔄 Easy migration to custom Hugging Face models

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file and add your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# Tavily API Configuration
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
3. Get your project URL and anon key from Supabase dashboard

### 4. API Setup

**Groq API:**
1. Sign up at [Groq](https://groq.com/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

**YouTube API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add it to your `.env.local` file

**Tavily API:**
1. Sign up at [Tavily](https://tavily.com/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your chat interface.

## Migrating to Hugging Face

To use your custom fine-tuned model from Hugging Face:

1. Update `app/lib/groq.ts` to use Hugging Face Inference API
2. Replace the Groq API key with your Hugging Face API token
3. Update the model endpoint to point to your custom model

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── Sidebar.tsx      # Chat history sidebar
│   │   └── ChatArea.tsx     # Main chat interface
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── groq.ts          # AI API integration
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts     # Chat API endpoint
│   │   └── get-role-skills/
│   │       └── route.ts     # Skill analysis API endpoint
│   ├── skills/
│   │   └── page.tsx         # Skill gap analysis page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── supabase-schema.sql      # Database schema
└── README.md
```

## Customization

- **Colors**: Modify the color scheme in `globals.css` and `tailwind.config.js`
- **AI Model**: Update `app/lib/groq.ts` to use different AI providers
- **Database**: The Supabase schema can be extended for additional features

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database and real-time features
- **Groq API** - AI chat completion
- **Lucide React** - Icons