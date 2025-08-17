# Firebase Setup Guide for Phonics App

## 🔥 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `phonics-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 🔥 **Step 2: Enable Authentication**

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## 🔥 **Step 3: Enable Firestore Database**

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 🔥 **Step 4: Get Firebase Configuration**

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</>) icon
4. Register app with nickname: `phonics-app-web`
5. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

## 🔥 **Step 5: Update Firebase Config in App**

1. Open `frontend/phonicnest/services/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
};
```

## 🔥 **Step 6: Install Firebase Dependencies**

In your frontend directory, run:

```bash
cd frontend/phonicnest
npm install firebase
```

## 🔥 **Step 7: Test Firebase Connection**

1. Start your backend: `cd backend && uvicorn main:app --reload`
2. Start your frontend: `cd frontend/phonicnest && npm start`
3. Try to sign up with a new account
4. Check Firebase Console → Authentication → Users to see if user was created
5. Check Firebase Console → Firestore Database → Data to see if user document was created

## 🔥 **Step 8: Security Rules (Optional for Development)**

In Firestore Database → Rules, you can use these test rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: Only for development!
    }
  }
}
```

**⚠️ Important**: These rules allow anyone to read/write. For production, you'll need proper security rules.

## 🔥 **Step 9: Production Security Rules**

When ready for production, replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only access their own attempts
    match /attempts/{attemptId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🔥 **Step 10: Environment Variables (Recommended)**

For better security, create a `.env` file in `frontend/phonicnest/`:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

Then update `firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
```

## ✅ **Verification Checklist**

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Firebase config copied to `firebase.js`
- [ ] Firebase dependencies installed
- [ ] App can create new users
- [ ] User data appears in Firestore
- [ ] Progress tracking works
- [ ] Password reset works

## 🚀 **Next Steps**

1. Test the complete flow: Sign up → Login → Upload video → View progress
2. Check that user progress is saved to Firestore
3. Verify that progress history is displayed correctly
4. Test password reset functionality

## 🆘 **Troubleshooting**

**Error: "Firebase: Error (auth/invalid-api-key)"**

- Check that your API key is correct in `firebase.js`

**Error: "Firebase: Error (auth/network-request-failed)"**

- Check your internet connection
- Verify Firebase project is in the correct region

**Error: "Firebase: Error (auth/too-many-requests)"**

- Wait a few minutes and try again
- Check if you've exceeded Firebase quotas

**Users not appearing in Authentication**

- Check that Email/Password provider is enabled
- Verify the sign-up function is being called correctly

**Data not appearing in Firestore**

- Check Firestore rules (should be in test mode for development)
- Verify the database was created successfully
- Check console for any JavaScript errors
