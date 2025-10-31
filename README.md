# Manga Reader Platform

A modern manga and comic reading platform built with Next.js, Convex, Clerk, and Shadcn UI.

## Features

- Browse manga and comics
- Purchase system (free or paid content)
- Seamless reading experience with vertical scroll
- User library to track purchases
- Admin dashboard for content management
- Authentication with Clerk

## Tech Stack

- Next.js 15
- Convex (Backend & Database)
- Clerk (Authentication)
- Shadcn UI + Tailwind CSS
- TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Convex:
```bash
npx convex dev
```

3. Set up Clerk:
- Create a Clerk account at https://clerk.com
- Create a new application
- Copy your API keys

4. Create `.env.local` file:
```env
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

5. Add admin users:
In Convex dashboard, add records to the `admins` table with userId from Clerk.

6. Run the development server:
```bash
npm run dev
```

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to add all environment variables in Vercel dashboard.
