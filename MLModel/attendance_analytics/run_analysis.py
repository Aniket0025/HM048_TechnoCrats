"""
Complete analysis script for attendance analytics
"""

import sys
sys.path.append('src')
from feature_engineering import AttendanceFeatureEngineer
from prediction import AttendancePredictor
from analytics import AttendanceAnalytics
from report_generator import AttendanceReportGenerator
import pandas as pd
import os
from datetime import datetime

def main():
    print('Step 1: Loading and preprocessing data...')
    engineer = AttendanceFeatureEngineer()
    features_df = engineer.extract_features('data/attendance_data.xlsx')

    print('Step 2: Generating predictions...')
    predictor = AttendancePredictor()
    predictions_df = predictor.generate_predictions(features_df)

    print('Step 3: Computing analytics...')
    analytics_engine = AttendanceAnalytics()
    complete_analytics = analytics_engine.generate_complete_analytics(predictions_df)

    print('Step 4: Exporting predictions...')
    output_excel = os.path.join('outputs', 'attendance_predictions.xlsx')
    predictor.export_predictions(predictions_df, output_excel)

    print('Step 5: Generating HTML report...')
    institute_info = {
        'institute_name': 'Educational Institute',
        'department': 'Computer Science',
        'academic_year': '2024-2025',
        'division': 'A'
    }

    report_generator = AttendanceReportGenerator()
    success = report_generator.generate_complete_report(
        complete_analytics, 
        institute_info, 
        'outputs'
    )

    if success:
        print('\n' + '='*50)
        print('ANALYSIS COMPLETED SUCCESSFULLY!')
        print('='*50)
        
        # Display summary statistics
        analytics = complete_analytics['analytics']
        print(f'\n📊 SUMMARY STATISTICS:')
        print(f'• Total Students: {analytics["overview"]["total_students"]}')
        print(f'• Average Attendance: {analytics["overview"]["overall_average_attendance"]}')
        print(f'• At-Risk Students: {analytics["risk_analysis"]["at_risk_percentage"]}')
        print(f'• Irregular Patterns: {analytics["anomaly_analysis"]["irregular_percentage"]}')
        
        # Display insights
        print(f'\n🤖 KEY INSIGHTS:')
        for i, insight in enumerate(complete_analytics['insights'][:3], 1):
            print(f'{i}. {insight["category"]}: {insight["insight"]}')
        
        # Display top recommendations
        print(f'\n🎯 TOP RECOMMENDATIONS:')
        for i, rec in enumerate(complete_analytics['recommendations'][:3], 1):
            print(f'{i}. {rec["recommendation"]} ({rec["priority"]} priority)')
        
        print(f'\n📁 OUTPUT FILES GENERATED:')
        print(f'• Predictions Excel: {output_excel}')
        print(f'• HTML Report: outputs/attendance_report.html')
        
        print(f'\n✅ Analysis completed at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    else:
        print('ERROR: Failed to generate HTML report')

if __name__ == "__main__":
    main()
