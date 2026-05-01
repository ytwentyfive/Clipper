# Long Form Video Clipping Web App - Specification

## 1. Project Overview

- **Project Name**: ClipForge
- **Type**: Single-page web application (React + Vite)
- **Core Functionality**: Upload long-form videos, navigate timeline, select segments, and export clips
- **Target Users**: Content creators, video editors, podcasters

## 2. UI/UX Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Logo + Title + Upload Button)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              VIDEO PLAYER AREA                      │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TIMELINE / SCRUBBER BAR                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │                  │  │  CLIPS PANEL                    │ │
│  │  CLIP CONTROLS  │  │  - List of saved clips          │ │
│  │  (Start/End)    │  │  - Clip duration, thumbnail     │ │
│  │  Add Clip Btn   │  │  - Delete/Export options        │ │
│  │                  │  │                                 │ │
│  └──────────────────┘  └─────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop**: > 1024px (two-column layout for controls + clips)
- **Tablet**: 768px - 1024px (stacked layout)
- **Mobile**: < 768px (single column, compact timeline)

### Visual Design

#### Color Palette
- **Background**: `#0D0D0D` (near black)
- **Surface**: `#1A1A1A` (dark gray cards)
- **Surface Elevated**: `#252525` (hover states)
- **Primary**: `#FF6B35` (vibrant orange - main accent)
- **Primary Hover**: `#FF8555`
- **Secondary**: `#00D9FF` (cyan - timeline/selection)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#8A8A8A`
- **Text Muted**: `#5A5A5A`
- **Success**: `#4ADE80`
- **Danger**: `#EF4444`

#### Typography
- **Font Family**: `"Sora", sans-serif` (Google Fonts)
- **Headings**:
  - H1: 28px, weight 700
  - H2: 20px, weight 600
  - H3: 16px, weight 600
- **Body**: 14px, weight 400
- **Small/Labels**: 12px, weight 500
- **Monospace** (timecodes): `"JetBrains Mono", monospace`

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

#### Visual Effects
- Border radius: 8px (buttons/inputs), 12px (cards), 16px (main container)
- Box shadows: `0 4px 24px rgba(0,0,0,0.4)` (elevated elements)
- Transitions: 200ms ease-out (all interactive elements)
- Glow effect on primary buttons: `0 0 20px rgba(255,107,53,0.3)`

### Components

#### Header
- Logo: "ClipForge" with flame icon (CSS/emoji)
- Upload button (primary style with icon)
- Dark theme throughout

#### Video Player
- Custom controls overlay
- Play/Pause button (centered, large)
- Progress bar with buffer indicator
- Volume control
- Fullscreen toggle
- Current time / Duration display (monospace)
- Dark background with subtle gradient border

#### Timeline/Scrubber
- Waveform visualization (optional, can be placeholder)
- Draggable playhead
- Selection range highlight (cyan color)
- Frame markers every 10 seconds
- Zoom controls (optional)
- Current position indicator

#### Clip Controls Panel
- Start time input (HH:MM:SS:FF format)
- End time input
- Duration display (auto-calculated)
- "Add Clip" button (primary)
- Keyboard shortcuts hint

#### Clips Panel
- List of saved clips as cards
- Each card shows:
  - Thumbnail (generated from video frame)
  - Clip name (editable)
  - Duration
  - Start/End times
  - Delete button
  - Export button
- Empty state with helpful message
- Scrollable if many clips

#### Buttons
- Primary: Orange background, white text, glow on hover
- Secondary: Transparent with border
- Icon buttons: Circle, subtle background on hover

## 3. Functionality Specification

### Core Features

1. **Video Upload**
   - Click to upload or drag-and-drop
   - Support formats: MP4, WebM, MOV
   - File size display
   - Remove/replace video option

2. **Video Playback**
   - Standard playback controls
   - Keyboard shortcuts:
     - Space: Play/Pause
     - Left/Right Arrow: Seek 5 seconds
     - J: Rewind 10s
     - L: Forward 10s
     - I: Set start marker
     - O: Set end marker

3. **Clip Selection**
   - Set start point (click timeline or press I)
   - Set end point (click timeline or press O)
   - Visual selection on timeline
   - Manual time input
   - Adjust by dragging handles

4. **Clip Management**
   - Add clip to collection
   - Edit clip name
   - Delete clip
   - Reorder clips (optional)

5. **Clip Export**
   - Export individual clip
   - Uses browser's MediaRecorder API
   - Exports as WebM (browser-native)
   - Progress indicator during export

### User Interactions
- Hover states on all interactive elements
- Drag-and-drop for timeline seeking
- Double-click timeline to set point
- Scroll wheel zoom on timeline (optional)

### Data Handling
- Clips stored in React state (in-memory)
- No backend required
- Video loaded via URL.createObjectURL

### Edge Cases
- Handle video load errors gracefully
- Prevent adding empty clips (end > start)
- Handle very long videos (pagination in timeline)
- Mobile touch interactions

## 4. Acceptance Criteria

1. ✅ Can upload a video file via click or drag-drop
2. ✅ Video plays with full controls (play/pause/seek/volume/fullscreen)
3. ✅ Can set start and end points for a clip
4. ✅ Visual selection shown on timeline
5. ✅ Can add multiple clips to collection
6. ✅ Can delete clips from collection
7. ✅ Can export individual clips
8. ✅ Export produces downloadable video file
9. ✅ Responsive layout works on different screen sizes
10. ✅ Smooth animations and transitions
11. ✅ Dark theme applied throughout
12. ✅ Keyboard shortcuts work for video control