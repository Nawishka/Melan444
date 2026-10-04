# A little world for Shashi ♡

A complete, mobile-first romantic story from Melan to Shashi. Warm paper, plum typography, original pastel SVG illustrations, a small moonlit garden, and a quiet letter at the end. Plain HTML, CSS and JavaScript; no build tools or runtime dependencies.

## Files

```text
shashi/                     (repository root; any folder name works)
├── index.html
├── styles.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    ├── illustrations/
    │   ├── couple.svg      original recurring standing couple
    │   └── seated.svg      the same couple beneath the moon
    ├── icons/
    │   └── heart.svg
    └── audio/
        └── .gitkeep        optional music goes here
```

## Put your own letter here

Open **script.js**. The very first configuration value is:

```js
const FINAL_MESSAGE = `
PASTE MY PERSONAL MESSAGE HERE
`;
```

Replace that line inside the backticks with your message. Separate paragraphs with a blank line. Keep the opening and closing backticks. If your letter itself contains a backtick, write \` instead; if it contains `${`, write `\${` instead. Ordinary quotes, emoji and line breaks are fine. The letter renders as plain text, never HTML.

Until you replace the placeholder, a complete gentle sample letter appears automatically. Preview and personalize it before sharing.

**CONFIG**, directly below `FINAL_MESSAGE`, contains the names, greeting, question, button text, reactions, flower/star counts, haptic toggle, audio settings, animation speed, and decoration intensity. Counts are safely clamped to 1–6 flowers and 1–8 stars. `animationSpeed` is a duration multiplier: 1 is normal; 0.5 is faster; 2 is slower. The final pause is always five seconds, independently of this setting. If you change the names, also update any explicitly personalized greeting text in CONFIG and the description in index.html.

## Optional music

1. Put a small, licensed MP3 in `assets/audio/dream.mp3`.
2. Set `enableSound: true` in CONFIG.
3. Change `audioFile` if your filename differs (case matters on hosting).

A discreet sound button appears. Music starts only when she presses it. It loops quietly, can be turned off, and pauses when the page is hidden. A missing/unsupported audio file disables the sound control without interrupting the story. With sound disabled (the default), no audio is requested. No external audio or font service is used.

## Test locally

Double-click `index.html` to open it in a browser. All illustrations, styling and scripts use relative local paths, and there are no fetch requests or JavaScript module imports, so the silent experience works directly from disk.

For HTTP testing, if Python is installed, open a terminal in this folder:

```sh
python -m http.server 8000
```

Open http://localhost:8000. For a phone on the same Wi-Fi, open `http://YOUR-COMPUTER-LAN-IP:8000` while the server is running; your firewall may need to permit local access. Stop the server with Ctrl+C. Use the deployed HTTPS link for final iPhone testing.

Try the whole journey:

1. Enter the garden, then collect every flower.
2. Light every star; the constellation becomes a heart.
3. Try Red Light with mouse, touch and keyboard. After four attempts, watch for the hidden reaction.
4. Green Light stays still and is the only progression choice.
5. Enjoy the mint success moment, the suspense, and the final glowing button.
6. After pressing that button, the letter must stay hidden for five full seconds. No countdown is shown.
7. Read the letter at your own pace, continue to the ending, then replay.
8. Refresh at any point: the experience begins again safely.

Test 320, 375, 390 and 430px widths, tablet, desktop, rotation, keyboard Tab/Enter, and your device's Reduce Motion setting. Small landscape screens intentionally allow vertical scrolling. There should be no sideways scrolling. Haptics are optional and silently skipped where unsupported (including many iPhones).

## Upload to GitHub

1. Create a new GitHub repository, for example `dreamy-love-story`.
2. Choose **Add file → Upload files** and upload `index.html`, `styles.css`, `script.js`, `README.md`, `.gitignore`, and the entire `assets` directory. Keep `index.html` at the repository root.
3. Commit the upload. Do not upload the ignored `.qa` folder, if present.

Alternatively, from this already initialized repository:

```sh
git add index.html styles.css script.js README.md assets .gitignore
git commit -m "Create a little world for Shashi"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/dreamy-love-story.git
git push -u origin main
```

Use your actual repository URL. If an `origin` remote already exists, check `git remote -v` before changing it. A private GitHub repository keeps the source off your public profile; the deployed website is still accessible to people with its link. The `noindex` metadata discourages search indexing but is not access control.

## Deploy on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Connect GitHub and import this repository.
3. Use the **Other** framework preset.
4. Keep Root Directory at the repository root (`./`). No install command or build command is required. Leave the build-command override empty and use the root as the output directory (`.`) if prompted.
5. No environment variables are needed. Choose **Deploy**.
6. Open the production URL, test the entire story on your phone, and send the link to Shashi.

Future commits to the connected production branch deploy automatically. There is no backend, database, login, analytics, paid API, framework, tracking, or cookie usage in this project. Vercel serves the files; normal hosting request handling is outside this site's JavaScript.

Official guidance: [Deploying Git repositories with Vercel](https://vercel.com/docs/git), [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

## Implementation notes

Verified using automated Chromium/Edge browser checks at 320×568, 375×667, 390×844, 430×932, 768×1024, 1440×900 and 844×390: complete scene progression, repeated touch escape boundaries, no horizontal overflow, no overlap with Green Light/question, replay, refresh and the five-second pause. Additional checks passed for keyboard progression, Reduced Motion, live viewport rotation, missing-audio fallback, the four-flower bouquet, HTTP asset paths and zero JavaScript runtime errors. Opening, choice, bouquet, letter and ending screenshots were inspected. Native iPhone/Safari testing was not available; test the deployed link on your actual phone before sending it.

- Eleven semantic scenes; only the active scene is displayed. Focus follows scene headings. Native buttons and live status text support keyboard and assistive technology.
- Red Light is confined to a separate arena below all critical content. Candidate positions are scored for distance from the pointer and clamped to arena/visual viewport bounds. It recalculates after viewport changes and scrolling. Keyboard activation gives the joke reaction; Tab can always reach Green Light. Red Light never navigates.
- Scene-owned timers are cancelled on navigation/replay. Flower/star clicks are one-shot; duplicate input cannot skip scenes.
- The reveal uses a fixed 5,000ms timer. Background-tab timer throttling can make it longer, never intentionally shorter.
- Motion uses transform/opacity wherever practical. Reduced Motion disables animated transitions, sparkles, breathing and flight while preserving the story and five-second pause.
- All three required asset paths are local and case-consistent. There are no external fonts, scripts, libraries or image dependencies.
- This is a ready-to-deploy project; no GitHub repository or live deployment has been created automatically.
