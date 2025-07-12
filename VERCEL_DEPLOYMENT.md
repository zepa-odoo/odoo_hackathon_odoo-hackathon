# Vercel Deployment Guide

This guide will help you deploy your StackIt Q&A Forum to Vercel with proper environment variable configuration.

## 🚀 Quick Deploy

1. **Push your code to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

## ⚙️ Environment Variables Setup

### Required Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | `your-32-character-secret-key-here` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-project.vercel.app` |
| `JWT_SECRET` | Secret key for JWT tokens (optional) | `your-jwt-secret-key-here` |

### Important Notes:

1. **NEXTAUTH_URL**: 
   - For development: `http://localhost:3000`
   - For Vercel: `https://your-project-name.vercel.app`
   - Replace `your-project-name` with your actual Vercel project name

2. **MONGODB_URI**: 
   - Use your MongoDB Atlas connection string
   - Make sure your IP whitelist includes `0.0.0.0/0` for Vercel's servers

3. **NEXTAUTH_SECRET**: 
   - Generate a secure 32-character string
   - You can use: `openssl rand -base64 32`

## 🔧 Step-by-Step Setup

### Step 1: Prepare Your Repository

Make sure your repository has:
- ✅ `.gitignore` (excludes `.env.local`)
- ✅ `env.example` (template for environment variables)
- ✅ All source code files
- ✅ `package.json` with correct dependencies

### Step 2: Deploy to Vercel

1. **Connect Repository**:
   ```
   vercel --git
   ```

2. **Or use Vercel Dashboard**:
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable:

   **MONGODB_URI**
   ```
   Name: MONGODB_URI
   Value: mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
   Environment: Production, Preview, Development
   ```

   **NEXTAUTH_SECRET**
   ```
   Name: NEXTAUTH_SECRET
   Value: your-32-character-secret-key-here
   Environment: Production, Preview, Development
   ```

   **NEXTAUTH_URL**
   ```
   Name: NEXTAUTH_URL
   Value: https://your-project-name.vercel.app
   Environment: Production, Preview, Development
   ```

   **JWT_SECRET** (optional)
   ```
   Name: JWT_SECRET
   Value: your-jwt-secret-key-here
   Environment: Production, Preview, Development
   ```

### Step 4: Deploy

1. Click **Deploy** in Vercel dashboard
2. Wait for build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally

2. **Environment Variables Not Working**:
   - Verify all variables are set in Vercel dashboard
   - Check that variable names match exactly
   - Redeploy after adding environment variables

3. **MongoDB Connection Issues**:
   - Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
   - Verify connection string is correct
   - Check database user permissions

4. **Authentication Not Working**:
   - Verify `NEXTAUTH_URL` matches your Vercel domain
   - Ensure `NEXTAUTH_SECRET` is set
   - Check that callback URLs are correct

### Debug Steps:

1. **Check Build Logs**: In Vercel dashboard, go to **Deployments** and check build logs
2. **Test Locally**: Run `npm run build` locally to catch issues
3. **Environment Check**: Add console.log to check if variables are loaded

## 🔄 Updating Your Deployment

### Automatic Updates:
- Push changes to your GitHub repository
- Vercel will automatically redeploy

### Manual Updates:
1. Go to Vercel dashboard
2. Click **Redeploy** on the latest deployment

### Environment Variable Updates:
1. Go to **Settings → Environment Variables**
2. Update the variable value
3. Redeploy your application

## 📱 Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS settings as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to your repository
2. **Use strong secrets** for `NEXTAUTH_SECRET` and `JWT_SECRET`
3. **Restrict MongoDB access** to Vercel's IP ranges when possible
4. **Regularly rotate secrets** in production
5. **Monitor your application** using Vercel Analytics

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check serverless function execution
- **Error Tracking**: Monitor for runtime errors

## 🎉 Success!

Your StackIt Q&A Forum is now live on Vercel! 

- **URL**: `https://your-project-name.vercel.app`
- **GitHub Integration**: Automatic deployments on push
- **Environment**: Production-ready with proper security

---

**Need Help?** Check Vercel's documentation or create an issue in your repository. 