# Quest High-Scores Leaderboard

A digital leaderboard kiosk app for Quest gaming events with cross-device live sync.

## URLs
- `/` — Mode selector
- `/kiosk` — Big screen leaderboard
- `/admin` — Score management

## Deploy to Vercel
1. Push to GitHub
2. Import on vercel.com/new
3. Add Vercel KV store (see below)
4. Deploy

## Setup Vercel KV (for cross-device sync)
1. In Vercel dashboard → your project → Storage tab
2. Click "Create" → "KV" → name it "quest-scores" → Create
3. It auto-connects and sets environment variables
4. Redeploy

## Tech: Next.js 15, React 19, Tailwind 4, Vercel KV
