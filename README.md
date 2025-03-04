# SpeechBuddy

SpeechBuddy is an interactive speech learning companion for children, designed to help improve speech and communication skills in a fun and engaging way.

## Features

- Interactive tiger buddy that responds to speech
- Speech recognition and synthesis
- Reward system with stars and XP
- Customizable settings for different learning needs
- Waitlist system with referral program

## Waitlist System

The application includes a comprehensive waitlist system:

- Users can join the waitlist with their email
- Each user gets a unique referral code
- Users can share their referral link to invite others
- For every 3 successful referrals, users move up 100 positions in the waitlist
- Email notifications are sent when users join the waitlist
- Admin dashboard to manage and monitor the waitlist

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Supabase for authentication and database
- Web Speech API for speech recognition and synthesis
- Lottie animations

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Copy `.env.example` to `.env.local` and update with your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   RESEND_API_KEY=your-resend-api-key
   NEXT_PUBLIC_APP_URL=your-app-url
   ```
4. Run the environment check with `npm run check-env`
5. Run the development server with `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application requires the following tables in Supabase:

- `users`: For user authentication and profiles
- `waitlist`: For managing the waitlist entries
- `email_verifications`: For email verification codes

Run the migration script in `supabase/migrations/` to set up the required tables and functions.

## Troubleshooting

### Email Service

If you encounter issues with email sending:

1. Verify your Resend API key is correctly set in `.env.local`
2. Ensure the API key starts with `re_`
3. Check the debug endpoint at `/api/debug` (development only)
4. Look for error messages in the server logs

### Database Connection

If you have issues connecting to Supabase:

1. Verify your Supabase URL and anon key in `.env.local`
2. Check if your IP is allowed in Supabase dashboard
3. Ensure the required tables exist in your database
4. Run the migration scripts if needed

### Debugging

In development mode, you can use the debug endpoint to check your configuration:

```
GET /api/debug
```

This will return information about your environment variables and database connection.

## License

[MIT](LICENSE)
