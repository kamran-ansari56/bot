# The Read — deployable build (Firebase + GitHub + Vercel)

Google sign-in, cloud sync, any device. Same Google account always loads the same progress.

## Stack
- Next.js, hosted free on Vercel
- Firebase — Google Auth + Firestore (free Spark plan)
- Serverless route `/api/chat` holds your Groq key; the browser never sees it
- Model: Groq free tier (Llama 3.3 70B)

## Cost
Hosting, auth, database, model: all free at single-user scale. Total $0.
Free tiers carry rate limits and provider-set terms that can change. The model
lives in one file (`app/api/chat/route.js`); swapping providers later is a small edit.

## File structure (must match exactly in the repo)
```
package.json            (root)
next.config.mjs         (root)
firestore.rules         (root)
app/layout.jsx
app/globals.css
app/page.jsx
app/api/chat/route.js
components/Dojo.jsx
lib/firebase.js
```

## 1. Firebase
1. console.firebase.google.com > Add project.
2. Build > Authentication > Get started > Sign-in method > enable **Google** > Save.
3. Build > Firestore Database > Create database > Production mode > pick a region.
4. Firestore > Rules tab > paste the contents of `firestore.rules` > Publish.
5. Project settings (gear) > General > Your apps > Web app (`</>`) > register.
   Copy these four config values: `apiKey`, `authDomain`, `projectId`, `appId`.

## 2. Groq key
console.groq.com/keys > Create API Key. Email or Google sign-in, no credit card. Copy it.

## 3. GitHub
Put the files in the repo in the exact structure above. On github.com:
- Delete any flat misplaced files (`Dojo.jsx`, `page.jsx`, `route.js` at root).
- Add file > Create new file > type the full slash-path (e.g. `app/api/chat/route.js`);
  the slashes create the folders. Paste contents. Commit. Repeat for each file.

## 4. Vercel
1. vercel.com > New Project > import the repo.
2. Add Environment Variables (Production):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GROQ_API_KEY`
3. Deploy. Copy the live URL.

## 5. Authorize the live domain in Firebase
Firebase > Authentication > Settings > Authorized domains > Add domain >
paste your Vercel domain (e.g. `the-read.vercel.app`). Google sign-in is rejected
from any domain not on this list. `localhost` is authorized by default for local dev.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local`, fill in the five values.
3. `npm run dev` → http://localhost:3000

## Data model
Firestore collection `dojo_state`, one document per user, document id = the user's
Firebase uid, field `state` = the full progress object. Rules restrict each document
to its owner.

## Security note
`/api/chat` is open to anyone who can reach the URL. Acceptable for a personal app.
To lock it down later, verify a Firebase ID token inside the route before calling Groq.
