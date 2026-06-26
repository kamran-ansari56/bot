# The Read — deployable build

Email login, cloud sync, any device. Same email always loads the same account.

## Stack
- Next.js (hosted free on Vercel)
- Supabase — email magic-link auth + Postgres storage (free tier)
- Serverless route `/api/chat` holds your Anthropic key; the browser never sees it

## Cost
- Hosting, auth, database: free at single-user scale.
- Model calls: billed per token to YOUR Anthropic key. This is the only charge. Cents per session for personal use. It exists because outside the artifact there is no free in-app model.

## Deploy — once, ~15 minutes

### 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor > New query > paste the contents of `supabase.sql` > Run.
3. Authentication > Providers > Email: ensure Email is enabled (magic link is on by default).
4. Project Settings > API: copy the Project URL and the `anon` `public` key.

### 2. Anthropic key
1. console.anthropic.com > API keys > create a key.
2. Add billing (Plans & Billing). Without billing the key returns errors.

### 3. Deploy to Vercel
1. Push this folder to a GitHub repo (or use the Vercel connector / CLI).
2. Import the repo in Vercel.
3. Add three Environment Variables (Project > Settings > Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `ANTHROPIC_API_KEY` = your Anthropic key
4. Deploy.

### 4. Point Supabase at the live URL
In Supabase > Authentication > URL Configuration, set Site URL to your Vercel domain and add it under Redirect URLs. The magic link must return to the deployed site.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local`, fill in the three values.
3. `npm run dev` → http://localhost:3000

## Sign-in flow
Enter email > one-tap link arrives > opens the app signed in. Progress upserts to `dojo_state` keyed by your user id. Sign in with the same email on a phone, laptop, anywhere — same data.

## Security note
`/api/chat` is open to anyone who can reach the URL. Acceptable for a personal single-user app. To lock it down later, verify the Supabase session JWT inside the route before forwarding to Anthropic.
