# Coffeegraphy - Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- MongoDB Atlas account (for cloud database)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create a GitHub repository**
   - Go to github.com and create a new repository
   - Name it `coffeegraphy` or any name you prefer
   - Don't initialize with README (we already have files)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set Up MongoDB Atlas (if not already done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Vercel access
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Your Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Backend Project**
   - Framework Preset: **Other**
   - Root Directory: **backend**
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `pip install -r requirements.txt`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGO_URL=mongodb+srv://your-connection-string
   DB_NAME=coffeegraphy
   JWT_SECRET=your-super-secret-key-here-change-this
   CORS_ORIGINS=*
   ADMIN_EMAIL=admin@coffeegraphy.com
   ADMIN_PASSWORD=admin123
   ```

5. **Deploy Backend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the backend URL (e.g., `https://your-backend.vercel.app`)

### Step 4: Deploy Frontend to Vercel

1. **Import Repository Again**
   - Go back to Vercel dashboard
   - Click "Add New" → "Project"
   - Select the same repository

2. **Configure Frontend Project**
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_BACKEND_URL=https://your-backend.vercel.app
   ```
   (Use the backend URL from Step 3)

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-frontend.vercel.app`

### Step 5: Update CORS Settings

After deployment, update your backend environment variables:

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update `CORS_ORIGINS` to your frontend URL:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
4. Redeploy the backend (Deployments → click ⋯ → Redeploy)

## Alternative: Single Monorepo Deployment

If you want to deploy both from a single Vercel project:

1. **Use the root `vercel.json`** (already created)
2. **Deploy from root directory**
3. **Add all environment variables** in one project
4. Vercel will handle routing automatically

## Testing Your Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Browse the menu and stores
4. Test placing an order
5. Check the rewards page

## Troubleshooting

### Backend Issues
- Check Vercel logs: Project → Deployments → Click deployment → View Function Logs
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend Issues
- Check browser console for errors
- Verify `VITE_BACKEND_URL` points to correct backend
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### CORS Errors
- Update `CORS_ORIGINS` in backend environment variables
- Include your frontend URL without trailing slash
- Redeploy backend after changes

## Custom Domain (Optional)

1. Go to your frontend project in Vercel
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `CORS_ORIGINS` in backend to include your custom domain

## Environment Variables Reference

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=coffeegraphy
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-frontend-url.vercel.app
ADMIN_EMAIL=admin@coffeegraphy.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```
VITE_BACKEND_URL=https://your-backend.vercel.app
```

## Post-Deployment

- Test all features thoroughly
- Monitor Vercel analytics
- Check MongoDB Atlas for database activity
- Set up custom domain if desired
- Enable Vercel Analytics for insights

## Continuous Deployment

Once set up, any push to your GitHub repository will automatically trigger a new deployment on Vercel!

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will automatically build and deploy your changes.
