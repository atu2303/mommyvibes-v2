# LittleDay — Ready to deploy

This folder is ready to upload to GitHub and deploy to Vercel.

## The foolproof deploy path (using GitHub Desktop)

The web-based GitHub upload caused file corruption last time. GitHub Desktop (a free app) handles folder uploads perfectly without the drag-and-drop issues.

### Step 1 — Unzip this file

Right-click `littleday-web.zip` → **Extract All...** → choose a location you'll remember (like your Desktop) → click Extract.

Open the unzipped folder. You should see these 6 items at the top level:
- `public` (folder)
- `src` (folder)
- `index.html`
- `package.json`
- `README.md` (this file)
- `vite.config.js`

If you don't see all 6, the extraction didn't complete — try again.

### Step 2 — Install GitHub Desktop (one-time, 3 min)

1. Go to [desktop.github.com](https://desktop.github.com)
2. Download for Windows, run the installer
3. When it opens, click **Sign in to GitHub.com**, authorize in the browser that opens, come back
4. Click **Finish** on the name/email screen

### Step 3 — Create the repo and upload

1. In GitHub Desktop: **File → New repository...**
2. Fill in:
   - **Name:** `mommyvibes` (or whatever you want)
   - **Local path:** click Choose and pick your Desktop
   - Leave "Initialize with README" **unchecked**
3. Click **Create repository**

4. Open File Explorer:
   - Go to the empty `mommyvibes` folder GitHub Desktop just created
   - In another window, open your unzipped `littleday-web` folder
   - Select everything inside `littleday-web` (Ctrl+A) — all 6 items
   - Copy (Ctrl+C), then paste into the empty `mommyvibes` folder (Ctrl+V)

5. Back in GitHub Desktop — you'll see all the files appear in the left panel
6. Bottom-left: in the **Summary** box, type `Initial upload` and click **Commit to main**
7. At the top, click **Publish repository**
8. **Uncheck** "Keep this code private" (Vercel free tier needs public)
9. Click **Publish repository**

Done. Go to github.com and you'll see your new repo with all files in place.

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. If you have an old broken project, delete it: click into it → Settings → scroll to bottom → Delete Project
3. Click **Add New... → Project**
4. Find your `mommyvibes` repo and click **Import**
5. Don't change anything — Vercel auto-detects Vite. Click **Deploy**
6. Wait ~90 seconds. Green checkmark = live URL appears at the top. Click it.

That URL is your live app. Share it with anyone.

---

## If something goes wrong

The build log in Vercel tells you exactly what. Common issues:
- **"Build failed in X ms"** — usually a file with wrong content. The log names the file.
- **"Module not found"** — the folder structure is wrong on GitHub. Check that `src/App.jsx` and `src/main.jsx` both exist under a `src` folder.

Send the last 20 lines of the Vercel log if stuck.

---

## Making changes later

Edit files on your computer → GitHub Desktop shows the changes → type a summary → click Commit to main → click Push origin. Vercel auto-redeploys within a minute.
