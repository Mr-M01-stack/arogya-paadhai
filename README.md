# Arogya Paadhai - Complete Project

## 🚀 Quick Deploy Instructions

### 1. Push to GitHub

#### Public Site
```bash
cd E:\arogya-v2\public-site
git init
git add .
git commit -m "Initial commit - Public site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arogya-paadhai-public.git
git push -u origin main
```

#### Admin Panel
```bash
cd E:\arogya-v2\admin-panel
git init
git add .
git commit -m "Initial commit - Admin panel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arogya-paadhai-admin.git
git push -u origin main
```

#### Backend API
```bash
cd E:\arogya-v2\backend
git init
git add .
git commit -m "Initial commit - Backend API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arogya-paadhai-api.git
git push -u origin main
```

### 2. Deploy to Netlify (Public Site + Admin Panel)

#### Method A: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder from:
   - `E:\arogya-v2\public-site\dist` → for public site
   - `E:\arogya-v2\admin-panel\dist` → for admin panel
3. Netlify gives you a live URL instantly

#### Method B: Git Integration
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import from Git"
3. Select GitHub → Choose your repo
4. Build settings auto-detect (Vite)
5. Deploy

### 3. Deploy Backend (Python Flask)

**Option 1: Render (Free)**
1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python run.py`
5. Deploy

**Option 2: Railway (Free)**
1. Go to https://railway.app
2. Start a new project from GitHub repo
3. Railway auto-detects Python/Flask

### 4. Update API URLs

After deploying the backend, update the API URLs:
- In `public-site/src/App.jsx` — change API_BASE_URL
- In `admin-panel/src/App.jsx` — change API_BASE_URL

Then rebuild and redeploy both sites.

## 📁 Project Structure

```
E:\arogya-v2\
├── public-site\      → React app (port 3000) → Netlify
├── admin-panel\      → React app (port 5173) → Netlify
└── backend\          → Flask API (port 5000) → Render/Railway
```

## 🔐 Login Credentials
- **Email:** admin@arogyapaadhai.com
- **Password:** admin123
