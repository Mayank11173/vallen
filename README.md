# Valentine Week — Mayank ❤ Gunjan

Fully animated Valentine Week website with multiple pages + a tiny full‑stack Node.js backend (no dependencies).

## Run

```bash
npm run dev
# or
npm start
```

Open `http://localhost:3000`

## Open Without Server (Optional)

You can also double‑click `public/index.html` and the site will still work (quiz/moments use local fallbacks).  
For full‑stack mode with APIs, use the server command above.

## Pages

- `/` — Home (Valentine week vibe)
- `/quiz` — Love Quiz (10 questions)
- `/favorite` — “What I like about you the most” + video
- `/moments` — Best moments gallery + lightbox
- `/valentine` — “My Vallentine” page with animated illustration

## Customize

- **Quiz questions/answers**: edit `data/quiz.json`
  - `answerIndex` is the 0-based index of the correct option
  - Replies are fixed to:
    - correct: `Mayank ka Pyarrr`
    - incorrect: `Gand pe thappad`
- **Video**:  `public/assets/video.mp4`
- **Music**: `public/assets/music.mp3`
- **Quiz “Feel Me” track**: `public/assets/music2.mp3`
- **Photos**: add images to `public/assets/moments/` (jpg/png/webp/gif/svg). If opening `moments.html` directly, update `public/assets/moments/manifest.json` with the filenames.

## Private Cloudflare Pages (free)

To make `maygunnagam.pages.dev` private without a paid plan, this repo includes a Cloudflare Pages middleware that enforces a password (`functions/_middleware.js`). Cloudflare Pages Functions run from a top‑level `functions/` directory. citeturn1search1turn1search4

**Steps**
1) Push this repo to GitHub.  
2) In Cloudflare Pages, create a new project from the Git repo (Pages Functions are **not** supported with direct uploads). citeturn1search1  
3) Set the project name to `maygunnagam` (if available) so you get `maygunnagam.pages.dev`. citeturn0search0  
4) In Cloudflare Pages project → Settings → Variables, add a **secret** named `SITE_PASSWORD` with your password. citeturn1search5  
5) Deploy. The site will prompt for the password in the browser.
x
