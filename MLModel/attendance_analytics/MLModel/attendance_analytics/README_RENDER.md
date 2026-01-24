# AI Attendance Analytics API - Render Deployment

## 🚀 Deploy on Render

This guide shows how to deploy your AI Attendance Analytics API on Render.com.

## 📋 Prerequisites

- Render account
- GitHub account
- Model files in `models/` directory

## 🛠️ Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - AI Attendance Analytics API"
git branch -M main
git remote add origin https://github.com/yourusername/attendance-analytics-api.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure deployment:

**Build Settings:**
- Build Command: `pip install -r render_requirements.txt`
- Start Command: `gunicorn render_api:app`

**Environment:**
- Environment: Python 3
- Region: Choose nearest
- Branch: main

### 3. Environment Variables (Optional)

Add these in Render dashboard:
- `PORT` (default: 10000)
- `FLASK_ENV` = `production`

## 🌐 API Endpoints

Once deployed, your API will be available at:

```
https://your-app-name.onrender.com/
https://your-app-name.onrender.com/health
https://your-app-name.onrender.com/predict
https://your-app-name.onrender.com/analyze
```

## 🧪 Test Your Deployed API

```python
import requests

# Test health
response = requests.get('https://your-app-name.onrender.com/health')
print(response.json())

# Test prediction
data = {
    "data": [
        {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-01", "attendance": 1},
        {"student_id": "STU001", "student_name": "John", "session_date": "2024-01-02", "attendance": 0}
    ]
}

response = requests.post('https://your-app-name.onrender.com/predict', json=data)
print(response.json())
```

## 📊 What's Included

- ✅ Flask API with ML model
- ✅ CORS enabled for web integration
- ✅ Health check endpoint
- ✅ Prediction and analysis endpoints
- ✅ Error handling
- ✅ Production-ready with Gunicorn

## 🔧 Files for Deployment

- `render_api.py` - Main API file
- `render_requirements.txt` - Dependencies
- `Procfile` - Render process configuration
- `.gitignore` - Git ignore file
- `models/` - Your trained ML model files

## 🎯 Next Steps

1. Deploy to Render
2. Test all endpoints
3. Integrate with your LMS
4. Monitor performance
5. Add authentication if needed

## 📞 Support

For issues:
- Check Render logs
- Verify model files are included
- Test locally first with `python render_api.py`
