# Phonics App - Complete Setup Guide

A comprehensive phonics learning application with AI-powered pronunciation analysis, Firebase authentication, and progress tracking.

## Project Structure

```
End-App/
├── backend/                 # FastAPI backend server
│   ├── main.py             # Main FastAPI application
│   ├── run.py              # Server startup script
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── ai_models/          # AI models for analysis
│   └── utils/              # Utility functions
└── frontend/               # React Native frontend
    └── phonicnest/         # Expo app
        ├── App.js          # Main app component
        ├── components/     # React components
        ├── screens/        # App screens
        └── services/       # API services
```

## Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development) or Xcode (for iOS development)

## Quick Start

### 1. Start the Backend Server

**Option A: Using the batch script (Windows)**

```bash
start_backend.bat
```

**Option B: Manual setup**

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The backend server will start on `http://localhost:8000`

### 2. Start the Frontend

**Option A: Using the batch script (Windows)**

```bash
start_frontend.bat
```

**Option B: Manual setup**

```bash
cd frontend/phonicnest
npm install
npm start
```

The Expo development server will start and show a QR code for mobile testing.

### 3. Testing the Connection

1. Open the app on your mobile device using Expo Go
2. Navigate to the "Upload Video" screen
3. Check the "Connection Status" section - it should show "Connected to Backend"
4. If disconnected, make sure the backend server is running on `http://localhost:8000`

## API Endpoints

### Health Check

- **GET** `/health` - Check if the backend is running

### Pronunciation Analysis

- **POST** `/grade` - Analyze video pronunciation
  - **Parameters:**
    - `video`: Video file (mp4, mov, avi, mkv)
    - `phoneme`: Phoneme to practice (e.g., "ai", "y", "z")

## Configuration

### Backend Configuration (`backend/config.py`)

- **CORS Origins**: Configure allowed frontend origins
- **Server Settings**: Host and port configuration
- **File Upload**: Maximum file size and allowed extensions
- **Model Paths**: Paths to AI models

### Frontend Configuration (`frontend/phonicnest/services/api.js`)

- **API Base URL**: Backend server URL (default: `http://localhost:8000`)
- **Timeout**: Request timeout settings

## Development

### Backend Development

The backend uses FastAPI with the following features:

- Automatic API documentation at `/docs`
- CORS middleware for frontend communication
- File upload handling
- AI model integration for audio and video analysis

### Frontend Development

The frontend is built with React Native and Expo:

- Navigation using React Navigation
- File picking with Expo Document Picker
- API communication with custom service
- Real-time connection status monitoring

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**

   - Ensure the backend server is running on port 8000
   - Check if the API URL in `api.js` matches your backend URL
   - Verify CORS settings in `config.py`

2. **Video Upload Issues**

   - Check file size limits in backend configuration
   - Ensure video format is supported (mp4, mov, avi, mkv)
   - Verify file permissions

3. **Mobile Testing Issues**
   - Use Expo Go app for testing
   - Ensure both devices are on the same network
   - Update the API URL to use your computer's IP address instead of localhost

### Network Configuration

For mobile testing, you may need to update the API URL in `frontend/phonicnest/services/api.js`:

```javascript
const API_BASE_URL = "http://YOUR_COMPUTER_IP:8000";
```

Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`).

## Production Deployment

### Backend Deployment

- Use a production WSGI server like Gunicorn
- Configure proper CORS origins for production domains
- Set up environment variables for sensitive configuration
- Use HTTPS in production

### Frontend Deployment

- Build the app for production using `expo build`
- Configure the API URL for production backend
- Test thoroughly on physical devices

## License

This project is for educational purposes.
