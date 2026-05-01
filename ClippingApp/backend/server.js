const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/exports', express.static('exports'));

// Ensure directories exist
['uploads', 'exports'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// ==================== API Routes ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ffmpeg: 'available' });
});

// Upload video
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const videoInfo = {
    id: uuidv4(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    createdAt: new Date().toISOString()
  };
  
  // Get video duration
  ffmpeg.ffprobe(req.file.path, (err, metadata) => {
    if (err) {
      return res.json({ ...videoInfo, duration: 0 });
    }
    videoInfo.duration = metadata.format.duration;
    videoInfo.width = metadata.streams[0]?.width;
    videoInfo.height = metadata.streams[0]?.height;
    res.json(videoInfo);
  });
});

// Get video info
app.get('/api/video/:id', (req, res) => {
  const videos = fs.readdirSync('uploads').filter(f => f.startsWith(req.params.id));
  if (videos.length === 0) return res.status(404).json({ error: 'Video not found' });
  
  const videoPath = path.join('uploads', videos[0]);
  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) return res.status(500).json({ error: 'Failed to probe video' });
    res.json({
      id: req.params.id,
      duration: metadata.format.duration,
      width: metadata.streams[0]?.width,
      height: metadata.streams[0]?.height
    });
  });
});

// Generate clips with AI (simulated for now)
app.post('/api/generate-clips', express.json(), (req, res) => {
  const { videoId, startTime, endTime, clipCount = 3 } = req.body;
  
  // In production, this would use whisper.cpp + ML to find best moments
  // For now, generate clips at regular intervals
  const duration = endTime - startTime;
  const clipDuration = Math.min(30, duration / clipCount);
  const clips = [];
  
  for (let i = 0; i < clipCount; i++) {
    const clipStart = startTime + (i * (duration / clipCount));
    clips.push({
      id: uuidv4(),
      name: `Clip ${i + 1}`,
      startTime: clipStart,
      endTime: clipStart + clipDuration,
      duration: clipDuration,
      score: Math.floor(70 + Math.random() * 30)
    });
  }
  
  res.json({ clips });
});

// Export clip (using FFmpeg)
app.post('/api/export', express.json(), (req, res) => {
  const { videoId, clipId, startTime, endTime, aspectRatio = '9:16' } = req.body;
  
  // Find the video file
  const files = fs.readdirSync('uploads').filter(f => f.startsWith(videoId));
  if (files.length === 0) return res.status(404).json({ error: 'Video not found' });
  
  const inputPath = path.join('uploads', files[0]);
  const outputFilename = `clip-${clipId}-${Date.now()}.mp4`;
  const outputPath = path.join('exports', outputFilename);
  
  // Calculate dimensions
  let width, height;
  if (aspectRatio === '9:16') {
    width = 1080;
    height = 1920;
  } else if (aspectRatio === '1:1') {
    width = 1080;
    height = 1080;
  } else {
    width = 1920;
    height = 1080;
  }
  
  // FFmpeg processing
  ffmpeg(inputPath)
    .setStartTime(startTime)
    .setDuration(endTime - startTime)
    .outputOptions([
      `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v libx264',
      '-preset fast',
      '-crf 23',
      '-c:a aac',
      '-b:a 128k'
    ])
    .output(outputPath)
    .on('end', () => {
      res.json({ 
        success: true, 
        downloadUrl: `/exports/${outputFilename}`,
        filename: outputFilename
      });
    })
    .on('error', (err) => {
      console.error('Export error:', err);
      res.status(500).json({ error: 'Export failed: ' + err.message });
    })
    .run();
});

// Generate captions using whisper.cpp (if available)
app.post('/api/captions', express.json(), (req, res) => {
  const { videoId, clipId, startTime, endTime } = req.body;
  
  // Find video
  const files = fs.readdirSync('uploads').filter(f => f.startsWith(videoId));
  if (files.length === 0) return res.status(404).json({ error: 'Video not found' });
  
  const videoPath = path.join('uploads', files[0]);
  const audioPath = `temp-audio-${clipId}.wav`;
  
  // Extract audio
  ffmpeg(videoPath)
    .setStartTime(startTime)
    .setDuration(endTime - startTime)
    .outputOptions(['-vn', '-acodec pcm_s16le', '-ar 16000', '-ac 1'])
    .output(audioPath)
    .on('end', () => {
      // Try to run whisper.cpp
      const whisperPath = './whisper.cpp/main';
      
      if (fs.existsSync(whisperPath)) {
        const whisper = spawn(whisperPath, [
          '-m', './whisper.cpp/models/ggml-base.bin',
          '-f', audioPath,
          '--output-json'
        ]);
        
        let output = '';
        whisper.stdout.on('data', (data) => { output += data; });
        whisper.on('close', () => {
          fs.unlinkSync(audioPath); // Cleanup
          try {
            const result = JSON.parse(output);
            res.json({ captions: result.text, segments: result.segments });
          } catch {
            res.json({ captions: 'Caption generation unavailable' });
          }
        });
      } else {
        // whisper.cpp not available, return mock
        fs.unlinkSync(audioPath);
        res.json({ 
          captions: '[Captions would appear here with whisper.cpp]',
          segments: []
        });
      }
    })
    .on('error', (err) => {
      fs.existsSync(audioPath) && fs.unlinkSync(audioPath);
      res.json({ captions: 'Audio extraction failed', error: err.message });
    })
    .run();
});

// Download exported clip
app.get('/exports/:filename', (req, res) => {
  const filePath = path.join('exports', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  
  res.download(filePath);
});

// Cleanup old files (run periodically)
setInterval(() => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  ['uploads', 'exports'].forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    });
  });
}, 60 * 60 * 1000); // Every hour

// Start server
app.listen(PORT, () => {
  console.log(`🎬 ClipForge API running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📦 Export directory: ${path.join(__dirname, 'exports')}`);
});