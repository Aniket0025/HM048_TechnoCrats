"""
Quick summary of attendance analytics results
"""

import sys
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from prediction import AttendancePredictor
from analytics import AttendanceAnalytics
import pandas as pd

def print_quick_summary():
    """Print a quick summary of results"""
    print("🎯 AI ATTENDANCE ANALYTICS - QUICK SUMMARY")
    print("=" * 50)
    
    # Load and process data
    engineer = AttendanceFeatureEngineer()
    features_df = engineer.extract_features('data/attendance_data.xlsx')
    
    predictor = AttendancePredictor()
    predictions_df = predictor.generate_predictions(features_df)
    
    analytics_engine = AttendanceAnalytics()
    complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
    
    analytics = complete_analytics['analytics']
    insights = complete_analytics['insights']
    recommendations = complete_analytics['recommendations']
    student_groups = complete_analytics['student_groups']
    
    # Key metrics
    total = len(predictions_df)
    avg_attendance = float(analytics['overview']['overall_average_attendance'].replace('%', ''))
    at_risk_pct = float(analytics['risk_analysis']['at_risk_percentage'].replace('%', ''))
    irregular_pct = float(analytics['anomaly_analysis']['irregular_percentage'].replace('%', ''))
    
    print(f"📊 Total Students: {total}")
    print(f"📈 Average Attendance: {avg_attendance:.1f}%")
    print(f"⚠️  At-Risk Students: {at_risk_pct:.1f}%")
    print(f"🔄 Irregular Patterns: {irregular_pct:.1f}%")
    
    # Top insights
    print("\n🤖 Key Insights:")
    for insight in insights[:3]:
        icon = "✅" if insight['type'] == 'positive' else "⚠️" if insight['type'] == 'moderate' else "❌"
        print(f"  {icon} {insight['insight']}")
    
    # Top recommendations
    print("\n🎯 Top Recommendations:")
    for i, rec in enumerate(recommendations[:2], 1):
        icon = "🔴" if rec['priority'] == 'high' else "🟡" if rec['priority'] == 'medium' else "🟢"
        print(f"  {icon} {rec['recommendation']}")
    
    # Student groups
    print(f"\n👥 Student Groups:")
    print(f"  🏆 Top Performers: {len(student_groups['top_performers'])}")
    print(f"  ⚠️  At-Risk Students: {len(student_groups['at_risk_students'])}")
    print(f"  🔄 Irregular Patterns: {len(student_groups['irregular_patterns'])}")
    
    print("\n✅ Analysis Complete!")
    print("📁 Check outputs/ for detailed reports")

if __name__ == "__main__":
    print_quick_summary()
