# Deployment Guide

## 🔑 Demo Accounts

**Admin Access:**
- Email: `admin@amarees.com`
- Password: `admin123`
- Access: Full system management

**Customer Access:**
- Email: `demo@customer.com`
- Password: `demo123`
- Access: Catalog browsing, order placement, profile management

## 🚀 Deploy to Render (Backend) + Vercel (Frontend)

### 1. Backend Deployment (Render)

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your GitHub repository
   - Select `backend` as root directory
   - Build Command: `./build.sh`
   - Start Command: `gunicorn ama_saree_backend.wsgi:application`

3. **Environment Variables** (in Render dashboard):
   ```
   SECRET_KEY=your-super-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

4. **Database** (Optional - Render provides PostgreSQL):
   - Add PostgreSQL database in Render
   - Copy `DATABASE_URL` to environment variables

### 2. Frontend Deployment (Vercel)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect GitHub repository
   - Framework: Vite
   - Root Directory: `./` (project root)

3. **Environment Variables** (in Vercel dashboard):
   ```
   VITE_API_BASE_URL=https://your-render-app.onrender.com
   VITE_APP_NAME=Ama Sarees
   ```

4. **Deploy**: Vercel will auto-deploy on every push to main branch

### 3. Update CORS Settings

After deployment, update your Render environment variables:
```
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

## 🔧 Manual Deployment Commands

### Backend (Alternative)
```bash
# Build for production
cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Start with gunicorn
gunicorn ama_saree_backend.wsgi:application --bind 0.0.0.0:$PORT
```

### Frontend (Alternative)
```bash
# Build for production
npm run build

# Deploy build folder to any static hosting
# (Netlify, AWS S3, GitHub Pages, etc.)
```

## 🌐 Custom Domain Setup

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render (Backend)
1. Go to Service Settings → Custom Domains
2. Add your API subdomain (e.g., api.yourdomain.com)
3. Update DNS records as instructed

## ✅ Post-Deployment Checklist

- [ ] Backend API accessible at your Render URL
- [ ] Frontend loads at your Vercel URL
- [ ] API calls work between frontend and backend
- [ ] CORS configured correctly
- [ ] Database migrations applied
- [ ] Authentication system working
- [ ] Demo accounts functional
- [ ] Sample data loaded (optional)
- [ ] SSL certificates active
- [ ] PWA manifest accessible
- [ ] Custom domains configured (if applicable)

## 🔍 Troubleshooting

**CORS Issues**: Ensure `CORS_ALLOWED_ORIGINS` includes your Vercel URL
**API Not Found**: Check `VITE_API_BASE_URL` points to your Render URL
**Build Failures**: Check build logs in Render/Vercel dashboards
**Database Issues**: Verify `DATABASE_URL` is correctly set