# Quick Deploy to Vercel - TL;DR

## 1. Push to GitHub (5 minutes)

```bash
# Initialize git if needed
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/coffeegraphy.git
git branch -M main
git push -u origin main
```

## 2. Deploy Backend (5 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. **Root Directory:** `backend`
4. **Framework:** Other
5. **Environment Variables:**
   ```
   MONGO_URL=your-mongodb-connection-string
   DB_NAME=coffeegraphy
   JWT_SECRET=change-this-to-random-string
   CORS_ORIGINS=*
   ```
6. Click **Deploy**
7. **Copy the backend URL** (e.g., `https://coffeegraphy-backend.vercel.app`)

## 3. Deploy Frontend (5 minutes)

1. Go to https://vercel.com/new again
2. Import the **same** GitHub repo
3. **Root Directory:** `frontend`
4. **Framework:** Vite
5. **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend-url-from-step-2.vercel.app
   ```
6. Click **Deploy**
7. Visit your live app! 🎉

## 4. Fix CORS (2 minutes)

1. Go to backend project in Vercel
2. Settings → Environment Variables
3. Edit `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```
4. Deployments → Redeploy

## Done! ✅

Your app is live at `https://your-frontend-url.vercel.app`

---

## Need MongoDB?

**Free MongoDB Atlas:**
1. https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Database Access → Add user
4. Network Access → Add IP `0.0.0.0/0`
5. Connect → Get connection string
6. Use in `MONGO_URL` environment variable

---

## Troubleshooting

**Blank screen?** 
- Check browser console (F12)
- Verify `VITE_BACKEND_URL` is correct

**API errors?**
- Check backend logs in Vercel
- Verify MongoDB connection string
- Check CORS settings

**Need help?** See full `DEPLOYMENT_GUIDE.md`
