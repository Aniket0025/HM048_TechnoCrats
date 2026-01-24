"""
Text-based report generator for attendance analytics
Displays comprehensive results in terminal format
"""

import sys
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from prediction import AttendancePredictor
from analytics import AttendanceAnalytics
import pandas as pd
import os
from datetime import datetime

def print_header(title):
    """Print a formatted header"""
    print("=" * 80)
    print(f"🎯 {title}")
    print("=" * 80)

def print_section(title):
    """Print a section header"""
    print(f"\n📊 {title}")
    print("-" * 60)

def print_student_table(students, title, max_students=10):
    """Print a formatted student table"""
    print(f"\n{title} (Top {min(max_students, len(students))} shown):")
    print(f"{'ID':<8} {'Name':<20} {'Attendance':<12} {'Risk Level':<12}")
    print("-" * 60)
    
    for i, student in enumerate(students[:max_students]):
        student_id = student.get('student_id', 'N/A')
        name = student.get('student_name', 'N/A')
        attendance = f"{student.get('attendance_percentage', 0):.1f}%"
        risk = student.get('risk_level', 'N/A')
        print(f"{student_id:<8} {name[:20]:<20} {attendance:<12} {risk:<12}")
    
    if len(students) > max_students:
        print(f"... and {len(students) - max_students} more students")

def print_insights(insights):
    """Print insights in a formatted way"""
    for i, insight in enumerate(insights, 1):
        icon = "✅" if insight['type'] == 'positive' else "⚠️" if insight['type'] == 'moderate' else "❌" if insight['type'] == 'concerning' else "🚨"
        print(f"{icon} {insight['category']}: {insight['insight']}")
        print(f"   📊 {insight['supporting_data']}")

def print_recommendations(recommendations):
    """Print recommendations with priority indicators"""
    priority_icons = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}
    
    for i, rec in enumerate(recommendations, 1):
        icon = priority_icons.get(rec['priority'], '⚪')
        print(f"{icon} {i}. {rec['recommendation']}")
        print(f"   📋 Category: {rec['category']}")
        print(f"   🎯 Priority: {rec['priority'].upper()}")
        
        if 'action_items' in rec and rec['action_items']:
            print("   📝 Action Items:")
            for j, action in enumerate(rec['action_items'], 1):
                print(f"      {j}. {action}")
        print()

def generate_text_report():
    """Generate comprehensive text report"""
    print_header("AI ATTENDANCE ANALYTICS - TEXT REPORT")
    print(f"📅 Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🏫 Institute: Educational Institute - Computer Science Department")
    print(f"📚 Academic Year: 2024-2025 - Division A")
    
    try:
        # Load and process data
        print_section("DATA PROCESSING")
        print("🔄 Loading and preprocessing attendance data...")
        
        engineer = AttendanceFeatureEngineer()
        features_df = engineer.extract_features('data/attendance_data.xlsx')
        print(f"✅ Loaded {len(features_df)} student records")
        print(f"✅ Extracted {len(engineer.feature_names)} behavioral features")
        
        # Generate predictions
        print_section("PREDICTION RESULTS")
        predictor = AttendancePredictor()
        predictions_df = predictor.generate_predictions(features_df)
        
        # Display prediction summary
        total_students = len(predictions_df)
        anomalies = predictions_df[predictions_df['irregular_flag'] == 'Irregular'].shape[0]
        normal = total_students - anomalies
        
        print(f"👥 Total Students: {total_students}")
        print(f"🔍 Anomalies Detected: {anomalies} ({(anomalies/total_students*100):.1f}%)")
        print(f"✅ Normal Patterns: {normal} ({(normal/total_students*100):.1f}%)")
        
        # Display attendance distribution
        print_section("ATTENDANCE DISTRIBUTION")
        attendance_dist = predictions_df['attendance_category'].value_counts()
        for category, count in attendance_dist.items():
            percentage = (count / total_students * 100)
            icon = "🏆" if category == "Excellent" else "👍" if category == "Good" else "😐" if category == "Average" else "⚠️"
            print(f"{icon} {category}: {count} students ({percentage:.1f}%)")
        
        # Display risk distribution
        print_section("RISK ASSESSMENT")
        risk_dist = predictions_df['risk_level'].value_counts()
        for risk, count in risk_dist.items():
            percentage = (count / total_students * 100)
            icon = "🔴" if risk == "High Risk" else "🟡" if risk == "At Risk" else "🟢" if risk == "Moderate Risk" else "✅"
            print(f"{icon} {risk}: {count} students ({percentage:.1f}%)")
        
        # Generate analytics
        print_section("ANALYTICS & INSIGHTS")
        analytics_engine = AttendanceAnalytics()
        complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)
        
        analytics = complete_analytics['analytics']
        insights = complete_analytics['insights']
        recommendations = complete_analytics['recommendations']
        student_groups = complete_analytics['student_groups']
        
        # Display key statistics
        print(f"📈 Overall Average Attendance: {analytics['overview']['overall_average_attendance']}")
        print(f"⚠️  At-Risk Students: {analytics['risk_analysis']['at_risk_percentage']}")
        print(f"🔄 Irregular Patterns: {analytics['anomaly_analysis']['irregular_percentage']}")
        
        # Display insights
        print_section("AI-GENERATED INSIGHTS")
        print_insights(insights)
        
        # Display recommendations
        print_section("ACTIONABLE RECOMMENDATIONS")
        print_recommendations(recommendations)
        
        # Display top performers
        if student_groups['top_performers']:
            print_section("TOP PERFORMERS (≥90% Attendance)")
            print_student_table(student_groups['top_performers'], "🏆 Excellent Students")
        
        # Display at-risk students
        if student_groups['at_risk_students']:
            print_section("STUDENTS NEEDING ATTENTION (<75% Attendance)")
            print_student_table(student_groups['at_risk_students'], "⚠️ At-Risk Students")
        
        # Display students with irregular patterns
        if student_groups['irregular_patterns']:
            print_section("IRREGULAR ATTENDANCE PATTERNS")
            print_student_table(student_groups['irregular_patterns'], "🔄 Irregular Patterns")
        
        # Display detailed statistics
        print_section("DETAILED STATISTICS")
        stats = analytics['performance_metrics']
        print(f"📊 Performance Breakdown:")
        print(f"   🏆 Top Performers (≥90%): {stats['top_performers']} students")
        print(f"   👍 Satisfactory (75-89%): {stats['satisfactory_performers']} students")
        print(f"   😐 Needs Improvement (<75%): {stats['needs_improvement']} students")
        
        # Display model information
        print_section("MODEL INFORMATION")
        model_info = predictor.get_model_info()
        print(f"🤖 Model Type: {model_info.get('model_type', 'N/A')}")
        print(f"📅 Training Date: {model_info.get('training_date', 'N/A')}")
        print(f"🔢 Feature Count: {model_info.get('feature_count', 'N/A')}")
        print(f"📊 Model Version: {model_info.get('version', 'N/A')}")
        
        # Display feature information
        print_section("FEATURE ENGINEERING")
        print(f"🔧 Total Features Extracted: {len(engineer.feature_names)}")
        print("📋 Feature List:")
        for i, feature in enumerate(engineer.feature_names, 1):
            print(f"   {i:2d}. {feature}")
        
        # Display file information
        print_section("OUTPUT FILES")
        print("📁 Generated Files:")
        print("   🤖 Model: models/isolation_forest.pkl")
        print("   📏 Scaler: models/scaler.pkl") 
        print("   📄 Metadata: models/metadata.json")
        print("   📊 HTML Report: outputs/attendance_report.html")
        print("   📈 Excel Predictions: outputs/attendance_predictions.xlsx")
        
        print_header("ANALYSIS COMPLETED SUCCESSFULLY!")
        print("🎯 The AI Attendance Analytics System has processed your data successfully!")
        print("📊 Check the HTML report for interactive visualizations")
        print("📈 Check the Excel file for detailed predictions")
        print("🤖 This text report provides a comprehensive overview")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error generating report: {str(e)}")
        print("Please check your data file and try again.")

if __name__ == "__main__":
    generate_text_report()
