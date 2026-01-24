"""
AI-Based Attendance Analytics System

A comprehensive attendance analytics pipeline that analyzes student attendance behavior,
detects irregular patterns, identifies at-risk students, and generates actionable insights.

Modules:
- feature_engineering: Extract behavioral features from raw attendance data
- model_training: Train Isolation Forest model for anomaly detection
- prediction: Generate predictions and classifications
- analytics: Compute insights and recommendations
- report_generator: Create professional HTML reports

Author: ML Engineering Team
Version: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "ML Engineering Team"
__email__ = "ml-team@education.com"

# Import key classes for easy access
from .feature_engineering import AttendanceFeatureEngineer
from .model_training import AttendanceModelTrainer
from .prediction import AttendancePredictor
from .analytics import AttendanceAnalytics
from .report_generator import AttendanceReportGenerator

__all__ = [
    'AttendanceFeatureEngineer',
    'AttendanceModelTrainer', 
    'AttendancePredictor',
    'AttendanceAnalytics',
    'AttendanceReportGenerator'
]
