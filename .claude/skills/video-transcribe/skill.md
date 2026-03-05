---
name: video-transcribe
description: Transcribe YouTube, TikTok, Instagram, and other video content
category: media
priority: P2
tags: [video, transcription, youtube, tiktok, instagram, whisper]
subskills:
  - youtube-transcribe
  - tiktok-transcribe
  - instagram-transcribe
  - general-video-transcribe
---

# Video Transcribe Skill

## Purpose
Extract spoken content from video platforms using audio transcription.

## Core Principle
"Transcribe first. Most video content is spoken, not visual."

## Subskills

### YouTube Transcribe
Download and transcribe YouTube videos using yt-dlp + Whisper.

### TikTok/Instagram Transcribe
Handle short-form content with different URL patterns.

### General Video Transcribe
Transcribe any video file (MP4, MOV, AVI, etc.) directly.

## Implementation

**Script Location:** `/home/mdwzrd/.claude/skills/video-transcribe/transcribe.py`

**Dependencies:**
- `yt-dlp` - Download videos/audio from URLs
- `openai-whisper` or `faster-whisper` - Transcription

**Usage:**
```bash
# Transcribe YouTube video
python /home/mdwzrd/.claude/skills/video-transcribe/transcribe.py https://youtube.com/watch?v=...

# Transcribe local video file
python /home/mdwzrd/.claude/skills/video-transcribe/transcribe.py /path/to/video.mp4

# Output includes timestamps for easy navigation
```

## Examples

### Example 1: YouTube Transcription
```
Input: https://youtube.com/watch?v=dQw4w9WgXcQ
Output:
[00:00] Never gonna give you up
[00:04] Never gonna let you down
[00:08] Never gonna run around and desert you
```

### Example 2: Summary Mode
```
Input: https://youtube.com/watch?v=... --summarize
Output:
Summary: This video discusses X, Y, and Z.
Key points:
1. First point...
2. Second point...
3. Third point...

Full transcript included below.
```

## Gold Standard Integration

### Read-Back Verification
- Verify transcript was generated
- Check file was downloaded successfully

### Executable Proof
- Show actual transcript output
- Demonstrate working on test video

### Loop Prevention
If download/transcription fails:
1. Check URL validity
2. Verify network access
3. Check dependency installation
4. Escalate after 3 attempts

---

**"Spoken words contain 95% of video information. Transcribe efficiently."**
