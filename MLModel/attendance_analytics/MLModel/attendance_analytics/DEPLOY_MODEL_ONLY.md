# 🚀 Deploy ML Model Only on Render

## 📋 Files Created for Model-Only Deployment

- `model_api.py` - ML model API server
- `model_requirements.txt` - Minimal dependencies
- `model_Procfile` - Render process configuration

## 🛠️ Quick Deployment Steps

### 1. Test Locally
```bash
python model_api.py
```

### 2. Create GitHub Repository
```bash
git init
git add model_api.py model_requirements.txt model_Procfile models/
git commit -m "ML Model API - Ready for Render"
git branch -M main
git remote add origin https://github.com/yourusername/attendance-model-api.git
git push -u origin main
```

### 3. Deploy on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:

**Build Settings:**
- Build Command: `pip install -r model_requirements.txt`
- Start Command: `gunicorn model_api:app`

**Environment:**
- Python 3
- Branch: main

### 4. Your Model API Endpoints

```
https://your-app-name.onrender.com/
https://your-app-name.onrender.com/health
https://your-app-name.onrender.com/model/info
https://your-app-name.onrender.com/predict
```

## 🧪 Test Your Deployed Model

```python
import requests

# Test model health
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
result = response.json()
print(f"Anomalies detected: {result['summary']['anomalies_detected']}")
```

## 📊 What This API Does

- ✅ Loads your Isolation Forest model
- ✅ Extracts 14 behavioral features
- ✅ Predicts attendance anomalies
- ✅ Returns risk assessments
- ✅ Provides model information
- ✅ Minimal dependencies for fast deployment

## 🎯 Integration with Your LMS

```javascript
// Use in your LMS frontend
const modelAPI = 'https://your-app-name.onrender.com';

async function predictAnomalies(attendanceData) {
    const response = await fetch(`${modelAPI}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: attendanceData })
    });
    return response.json();
}
```

## 🔧 Features

- **Lightweight**: Only ML model and essential dependencies
- **Fast**: Optimized for quick predictions
- **Simple**: Clean, focused API
- **Production Ready**: Gunicorn server
- **CORS Enabled**: Ready for web integration

## 📞 Next Steps

1. Deploy to Render
2. Test all endpoints
3. Integrate with your LMS
4. Monitor performance
5. Add authentication if needed
