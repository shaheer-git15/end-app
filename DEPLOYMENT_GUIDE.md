# Deployment Guide for Phonics App

## 🚀 **Backend Deployment (Python FastAPI)**

### Option 1: Local Development (Current Setup)
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 2: Deploy to Railway (Recommended)
1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```
3. **Deploy Backend**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

### Option 3: Deploy to Heroku
1. **Create Heroku Account**: Go to [heroku.com](https://heroku.com)
2. **Install Heroku CLI**:
   ```bash
   # Windows
   winget install --id=Heroku.HerokuCLI
   ```
3. **Deploy Backend**:
   ```bash
   cd backend
   heroku create your-phonics-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Option 4: Deploy to DigitalOcean App Platform
1. **Create DigitalOcean Account**: Go to [digitalocean.com](https://digitalocean.com)
2. **Deploy via App Platform**:
   - Connect your GitHub repository
   - Select the `backend` folder
   - Choose Python environment
   - Set build command: `pip install -r requirements.txt`
   - Set run command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📱 **Frontend Deployment (React Native Expo)**

### Option 1: Expo Development Build (Recommended)
1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```
2. **Login to Expo**:
   ```bash
   eas login
   ```
3. **Configure EAS**:
   ```bash
   cd frontend/phonicnest
   eas build:configure
   ```
4. **Build for Android**:
   ```bash
   eas build --platform android
   ```
5. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

### Option 2: Expo Go (Development Only)
```bash
cd frontend/phonicnest
npx expo start
```

## 🔧 **Configuration Updates**

### After Backend Deployment:
1. **Update Frontend API URL** in `frontend/phonicnest/services/networkConfig.js`:
   ```javascript
   const config = {
     [ENVIRONMENTS.PRODUCTION]: {
       API_BASE_URL: 'https://your-backend-url.com', // Your deployed backend URL
       TIMEOUT: 30000,
     },
   };
   ```

2. **Switch to Production Environment**:
   ```javascript
   const CURRENT_ENVIRONMENT = ENVIRONMENTS.PRODUCTION;
   ```

### Firebase Configuration:
1. **Update Firestore Rules** in Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // For development
       }
     }
   }
   ```

## 🌐 **Domain Setup (Optional)**

### Custom Domain for Backend:
1. **Railway**: Add custom domain in project settings
2. **Heroku**: Add custom domain in app settings
3. **DigitalOcean**: Configure domain in app settings

### SSL Certificate:
- **Railway**: Automatic SSL
- **Heroku**: Automatic SSL
- **DigitalOcean**: Automatic SSL

## 📊 **Monitoring & Analytics**

### Backend Monitoring:
1. **Railway**: Built-in monitoring
2. **Heroku**: Add New Relic or DataDog
3. **DigitalOcean**: Built-in monitoring

### Frontend Analytics:
1. **Expo Analytics**: Built-in with EAS
2. **Firebase Analytics**: Already configured

## 🔒 **Security Considerations**

### Production Security:
1. **Update Firestore Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /attempts/{attemptId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

2. **Environment Variables**:
   - Store sensitive data in environment variables
   - Use `.env` files for local development
   - Use platform environment variables for production

## 🚀 **Quick Deployment Checklist**

### Backend:
- [ ] Choose deployment platform (Railway/Heroku/DigitalOcean)
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Update frontend API URL

### Frontend:
- [ ] Update API configuration
- [ ] Build with EAS
- [ ] Test on device
- [ ] Distribute APK/IPA

### Database:
- [ ] Verify Firebase project settings
- [ ] Update Firestore rules
- [ ] Test data operations

## 📞 **Support**

If you encounter issues:
1. Check platform-specific logs
2. Verify API endpoints are accessible
3. Test with Postman or similar tool
4. Check Firebase Console for errors

## 🔄 **Continuous Deployment**

### GitHub Actions (Optional):
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
```

---

**Note**: Choose the deployment option that best fits your needs. Railway is recommended for beginners due to its simplicity and free tier.
