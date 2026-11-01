# NumeroScope

NumeroScope is a numerology organizer built with Next.js. Enter a date of birth and birth, childhood, and most-used names to generate a report.

## Report sections

- The original 23 name and date-of-birth numbers, plus Life Path and Birthday numbers.
- Annual Essence transits, the current energy code, Highlight Year, milestone years, and red-letter ages.
- Expression Style and Energy Realms profiles.
- A birth-date Psychomatrix with its working numbers, cells, lines, and diagonals.
- The seven Pythagorean and Chaldean bridge numbers.
- An optional house or apartment number, including letter-to-number conversion.

Name-based calculations use Pythagorean or Chaldean values as indicated in the report. Name segments are taken from the first, middle, and last parts of the entered name. The house-number calculation uses only the entered house or unit identifier; do not include the street name.

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Set `LOGIN_USERNAME`, `LOGIN_PASSWORD`, and `SALT` in a local `.env` file for login and token signing. The Neon database URL is stored in the ignored `.env.local` file. Copy `.env.example` when setting up a new environment, and keep all values private. Open [http://localhost:3000](http://localhost:3000) to use the app.

## Saved report history and Vercel

The app stores the 20 most recent reports for the currently signed-in username in Neon. The schema is versioned in [`migrations/001_numero_history.sql`](migrations/001_numero_history.sql) and has already been applied to the linked `numero-scope` Neon project.

Use the **History** button in the app header to open saved reports. Selecting a report restores its inputs and saved calculation results. Use the trash icon beside a report to remove it from both the history list and database.

Before deploying to Vercel, add these environment variables under **Project Settings → Environment Variables** for Production, Preview, and Development:

| Variable | Value |
| --- | --- |
| `LOGIN_USERNAME` | Your application login username |
| `LOGIN_PASSWORD` | A strong application login password |
| `SALT` | A long, random signing secret |
| `DATABASE_URL` | The pooled Neon connection string (hostname contains `-pooler`) |

Do not add `DATABASE_URL_UNPOOLED` to Vercel; reserve it for migrations or database administration. The provided `.env.example` lists both shapes without exposing credentials.

## Checks

```bash
npm run lint
npm run build
```
