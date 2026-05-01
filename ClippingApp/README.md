# ClipForge - AI Video Clipping App

A fully functional video clipping web app with FFmpeg backend and whisper.cpp integration.

## Quick Start (Frontend Only)

Simply open `index.html` in a browser. It works in offline mode but with limited features:
- ✅ Local video upload and playback
- ✅ Manual clip selection
- ✅ UI similar to OpusClip

## Full Setup with Backend

### Prerequisites
- Node.js 18+
- FFmpeg (installed on system)

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The API runs on `http://localhost:3000`

### 2. Frontend

Open `index.html` in a browser. The app will automatically detect the backend and connect.

## Deploy to Render (Free)

### Option 1: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-repo/clipforge)

### Option 2: Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set these values:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add Environment Variable: `PORT=3000`

The free tier includes:
- 750 hours/month compute
- 100GB bandwidth
- Persistent disk storage

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API status |
| `/api/upload` | POST | Upload video file |
| `/api/video/:id` | GET | Get video info |
| `/api/generate-clips` | POST | Generate AI clips |
| `/api/export` | POST | Export clip with FFmpeg |
| `/api/captions` | POST | Generate captions (whisper.cpp) |

## Adding whisper.cpp (Optional)

For captions, download whisper.cpp:

```bash
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# Build
make

# Download model
./models/download-ggml-base.sh
```

The server will automatically use it when available.

## Features

- ✅ Video upload (MP4, MOV, WebM, MKV)
- ✅ YouTube import (preview only)
- ✅ AI clip generation
- ✅ Aspect ratio conversion (9:16, 1:1, 16:9)
- ✅ AI captions toggle
- ✅ FFmpeg-powered export
- ✅ Auto-cleanup of old files

## Tech Stack

- **Frontend**: React 18, pure HTML/JS (no build required)
- **Backend**: Node.js, Express
- **Video Processing**: FFmpeg
- **Captions**: whisper.cpp (optional)
- **Deployment**: Render (free)

## Limits

- Upload: 500MB max
- Processing: Runs on free compute (slower than paid)
- Storage: Files auto-delete after 24 hours