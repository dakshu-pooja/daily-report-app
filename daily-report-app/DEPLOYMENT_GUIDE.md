# Vercel Deployment Guide - Daily Report App

This guide explains how to deploy your Next.js application (both Frontend and Backend) to Vercel and connect it to a production database.

## Prerequisites
1. A [Vercel](https://vercel.com) account.
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

---

## Step 1: Push My Fixes to Your Repository
I have fixed the code so it can build successfully. You must send these changes to your Git repository:
1. Open your terminal in the project folder.
2. Run these commands:
   ```bash
   git add .
   git commit -m "Fix build errors and add vercel configuration"
   git push origin main
   ```

## Step 2: Set Up a Production Database (PostgreSQL)
Vercel does not support SQLite (`dev.db`). You need a PostgreSQL database.
1. Go to your **Vercel Dashboard**.
2. Click on the **Storage** tab.
3. Select **Create Database** and choose **Vercel Postgres**.
4. Follow the prompts to create the database and connect it to your project.
5. This will automatically add a `POSTGRES_PRISMA_URL` and other environment variables to your project.

## Step 3: Configure Environment Variables
You need to tell Prisma and NextAuth how to work in production.
1. Go to your **Vercel Project Settings** > **Environment Variables**.
2. Add/Verify these variables:
   - `DATABASE_URL`: Set this to your PostgreSQL connection string.
   - `AUTH_SECRET`: Generate a random string (required for NextAuth v5).
   - `AUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
   - `NEXTAUTH_SECRET`: Same as `AUTH_SECRET` (for backward compatibility).
   - `NEXTAUTH_URL`: Same as `AUTH_URL`.

## Step 4: Update Prisma for Production
In your `prisma/schema.prisma`, ensure the provider is `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
*(I have already verified this is correct in your project)*.

## Step 5: Trigger Build & Verify
1. Once you push your code, Vercel will start a deployment.
2. Click on the **Deployments** tab in Vercel to see the progress.
3. If it shows "Ready" (Green), your app is live!
4. If it shows "Error", click on it to see the **Build Logs**. The fixes I made should prevent build errors.

---

### Troubleshooting 404 Errors
- **"NOT_FOUND" page**: This usually happens if the build failed. Check the **Build Logs** in Vercel.
- **API 404**: In Next.js, API routes are at `/api/...`. Ensure you are calling the correct URL.
- **Database Error**: If the app loads but you can't log in, it's likely a database connection issue. Ensure you ran `npx prisma db push` or similar on Vercel.
