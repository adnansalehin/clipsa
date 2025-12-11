# Clipsa - AI Video Generation Platform

Clipsa is a Next.js-based AI video generation platform that combines image-to-video conversion, text-to-speech narration, and speech-to-text input capabilities.

## Environment Variables

The following environment variables are required for the application to function properly. Add them to your `.env.local` file:

### Required Environment Variables

#### Database
```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/clipsa
```
- **MONGODB_URI**: MongoDB connection string. Defaults to `mongodb://localhost:27017/clipsa` for local development.

#### Job Queue (Upstash QStash)
```bash
# QStash token for background job processing
QSTASH_TOKEN=your_qstash_token_here
```
- **QSTASH_TOKEN**: Required in production. Get this from your [Upstash QStash dashboard](https://console.upstash.com/qstash).

#### AI Services (Fal.ai)
```bash
# Fal.ai API key for AI model inference
FAL_KEY=your_fal_api_key_here
```
- **FAL_KEY**: Optional but recommended. Get this from your [Fal.ai dashboard](https://fal.ai). If not provided, AI operations will be mocked in development.

#### ElevenLabs (Text-to-Speech & Speech-to-Text)
```bash
# ElevenLabs API key for text-to-speech and speech-to-text services
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Public ElevenLabs API key (same as above, exposed to client-side code)
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
- **ELEVENLABS_API_KEY**: Required for server-side ElevenLabs API calls (text-to-speech generation)
- **NEXT_PUBLIC_ELEVENLABS_API_KEY**: Required for client-side speech-to-text functionality

#### Application Configuration
```bash
# Base URL of your application (used for webhooks)
APP_URL=http://localhost:3000

# Development override for QStash signature verification
VERIFY_QSTASH_IN_DEV=true
```
- **APP_URL**: Base URL of your application. Defaults to `http://localhost:3000`
- **VERIFY_QSTASH_IN_DEV**: Set to `true` to enable QStash signature verification in development. Defaults to false.

#### Node Environment
```bash
# Node.js environment (automatically set by Next.js)
NODE_ENV=development
```
- **NODE_ENV**: Automatically managed by Next.js. Used to determine production vs development behavior.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clipsa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the required environment variables above into your `.env.local` file
   - Obtain API keys from the respective service providers

4. **Set up external services**
   - **MongoDB**: Set up a MongoDB instance (local or cloud)
   - **Upstash QStash**: Create a QStash account and get your token
   - **Fal.ai**: Create an account and get your API key
   - **ElevenLabs**: Create an account and get your API key

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Features

- **Image-to-Video Generation**: Convert images to videos using AI
- **Text-to-Speech**: Generate audio narration from text using ElevenLabs
- **Speech-to-Text**: Voice input for narration using Web Speech API or ElevenLabs Scribe
- **Background Job Processing**: Asynchronous processing using Upstash QStash
- **Responsive UI**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS

## API Endpoints

- `POST /api/projects` - Create video generation projects
- `POST /api/jobs` - Process background jobs (protected by QStash)
- `POST /api/elevenlabs/scribe-token` - Generate ElevenLabs Scribe tokens
- `POST /api/webhooks/fal` - Fal.ai webhook handler
- `POST /api/webhooks/elevenlabs` - ElevenLabs webhook handler

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run Jest tests
- `npm run validate` - Run all validation checks

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── api/              # API client
│   ├── jobs/             # Background job system
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and validation
5. Submit a pull request

## License

[Add your license information here]