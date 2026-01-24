# 🚀 **Setup & Execution Guide**

## 📋 **Prerequisites**
- Python 3.8+ installed
- pip package manager
- Excel file with attendance data

## 🛠️ **Step-by-Step Setup**

### **Step 1: Install Dependencies**
```bash
pip install -r requirements.txt
```

### **Step 2: Prepare Your Data**
1. Place your attendance Excel file in the `data/` folder
2. Name it: `attendance_data.xlsx`
3. Required columns:
   - `student_id` (unique identifier)
   - `student_name` (for reporting)
   - `session_date` (date of attendance)
   - `attendance` (1 = Present, 0 = Absent)

### **Step 3: Generate Sample Data (Optional)**
```bash
python create_sample_data.py
```
This creates sample data for testing with 50 students over 30 days.

### **Step 4: Train the ML Model**
```bash
# Windows
scripts\train_model.bat

# Linux/Mac
chmod +x scripts/run_analysis.sh
./scripts/run_analysis.sh
```

### **Step 5: Run Complete Analysis**
```bash
# Windows
scripts\run_analysis.bat

# Linux/Mac
./scripts/run_analysis.sh
```

## 📊 **Output Files Generated**
- `models/isolation_forest.pkl` - Trained ML model
- `models/scaler.pkl` - Feature scaler
- `models/metadata.json` - Model metadata
- `outputs/attendance_predictions.xlsx` - Detailed predictions
- `outputs/attendance_report.html` - Interactive HTML report

## 🎯 **Data Format Requirements**

### **Excel File Structure**
```
| student_id | student_name | session_date | attendance |
|------------|-------------|--------------|------------|
| STU001     | John Doe    | 2024-01-01   | 1          |
| STU001     | John Doe    | 2024-01-02   | 1          |
| STU002     | Jane Smith  | 2024-01-01   | 0          |
```

### **Alternative Format (Aggregated)**
```
| student_id | student_name | attendance_percentage | total_sessions |
|------------|-------------|---------------------|---------------|
| STU001     | John Doe    | 85.5                | 30            |
| STU002     | Jane Smith  | 72.3                | 30            |
```

## 🔧 **Customization Options**

### **Model Parameters**
Edit `src/model_training.py` to adjust:
- `contamination` - Expected anomaly rate (default: 0.1)
- `n_estimators` - Number of trees (default: 100)

### **Risk Thresholds**
Edit `src/prediction.py` to modify:
- Attendance risk threshold (default: 75%)
- Performance categories
- Anomaly detection sensitivity

### **Report Customization**
Edit `src/report_generator.py` to change:
- Institute information
- Report styling
- Chart colors and types

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Python not found"**
   - Install Python 3.8+ from python.org
   - Add Python to system PATH

2. **"Module not found"**
   - Run: `pip install -r requirements.txt`
   - Check Python version compatibility

3. **"Excel file not found"**
   - Ensure file is in `data/` folder
   - Check filename: `attendance_data.xlsx`

4. **"Model training failed"**
   - Check data quality and format
   - Ensure sufficient data (minimum 10 students)
   - Verify no missing values in critical columns

5. **"Report generation failed"**
   - Check matplotlib backend
   - Ensure sufficient memory for charts
   - Verify template permissions

### **Debug Mode**
Add this to scripts for detailed error logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 **Performance Optimization**

### **Large Datasets**
- For 1000+ students, increase memory
- Use chunked processing for very large datasets
- Consider sampling for initial testing

### **Speed Improvements**
- Use SSD storage for faster I/O
- Increase RAM for better performance
- Close unnecessary applications

## 🎓 **Educational Use**

### **For Students**
- Study the feature engineering pipeline
- Understand anomaly detection concepts
- Learn ML model interpretation

### **For Teachers**
- Use as ML project demonstration
- Show real-world application
- Explain industry practices

### **For Interviews**
- Discuss feature selection rationale
- Explain model choice (Isolation Forest)
- Demonstrate end-to-end ML pipeline

## 🔗 **Integration Options**

### **LMS Integration**
```python
from src import AttendanceFeatureEngineer, AttendancePredictor

# Load and process data
engineer = AttendanceFeatureEngineer()
features = engineer.extract_features('lms_attendance.xlsx')

# Generate predictions
predictor = AttendancePredictor()
predictions = predictor.generate_predictions(features)
```

### **API Integration**
```python
from flask import Flask, jsonify
from src import AttendanceAnalytics

app = Flask(__name__)

@app.route('/api/attendance-analytics')
def get_analytics():
    # Return analytics as JSON
    return jsonify(complete_analytics)
```

## 📞 **Support**

### **Documentation**
- Check inline code comments
- Review function docstrings
- Read module descriptions

### **Common Questions**
- **Q: Can I use CSV instead of Excel?**
  A: Yes, modify the `load_data` method in `feature_engineering.py`

- **Q: How to handle multiple classes?**
  A: Process each class separately or add class_id column

- **Q: Can I customize the report?**
  A: Yes, edit the HTML template in `report_generator.py`

---

**Built with ❤️ for educational analytics and ML learning!**
