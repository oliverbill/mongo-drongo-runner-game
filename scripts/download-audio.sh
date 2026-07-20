#!/bin/bash
# Exit on error
set -e

URL=$1

if [ -z "$URL" ]; then
  echo "Error: No URL provided."
  echo "Usage: npm run download-audio -- <youtube_url>"
  exit 1
fi

echo "Downloading and converting audio from: $URL"
# -x: extract audio
# --audio-format mp3: convert to mp3
# --audio-quality 0: best quality
yt-dlp -x --audio-format mp3 --audio-quality 0 "$URL" -o "%(title)s.%(ext)s"

echo "Done!"
