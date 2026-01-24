"""
Sample Data Generator for Attendance Analytics

This script creates sample attendance data for testing the AI attendance analytics system.
It generates realistic attendance patterns with various scenarios including regular students,
at-risk students, and those with irregular patterns.

Author: ML Engineering Team
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

def generate_sample_attendance_data(num_students=50, num_days=30):
    """
    Generate sample attendance data for testing.
    
    Args:
        num_students (int): Number of students to generate
        num_days (int): Number of days of attendance data
        
    Returns:
        pd.DataFrame: Sample attendance data
    """
    print(f"Generating sample attendance data for {num_students} students over {num_days} days...")
    
    # Create student profiles
    students = []
    attendance_records = []
    
    # Define student types with different attendance patterns
    student_types = [
        {'type': 'excellent', 'probability': 0.2, 'base_attendance': 0.95},
        {'type': 'good', 'probability': 0.3, 'base_attendance': 0.85},
        {'type': 'average', 'probability': 0.3, 'base_attendance': 0.70},
        {'type': 'poor', 'probability': 0.2, 'base_attendance': 0.50}
    ]
    
    # Generate students
    for i in range(num_students):
        student_id = f"STU{i+1:03d}"
        student_name = f"Student {i+1}"
        
        # Assign student type
        rand = random.random()
        cumulative_prob = 0
        student_type = 'average'
        
        for st in student_types:
            cumulative_prob += st['probability']
            if rand <= cumulative_prob:
                student_type = st['type']
                break
        
        students.append({
            'student_id': student_id,
            'student_name': student_name,
            'type': student_type,
            'base_attendance': next(st['base_attendance'] for st in student_types if st['type'] == student_type)
        })
    
    # Generate attendance records for each student
    start_date = datetime.now() - timedelta(days=num_days)
    
    for student in students:
        consecutive_absent = 0
        days_since_last_present = 0
        
        for day in range(num_days):
            session_date = start_date + timedelta(days=day)
            
            # Determine attendance based on student type and patterns
            base_prob = student['base_attendance']
            
            # Add some randomness and patterns
            if student['type'] == 'excellent':
                # Excellent students: very consistent, occasional sick days
                attendance_prob = base_prob
                if random.random() < 0.02:  # 2% chance of sick day
                    attendance_prob = 0.1
                    
            elif student['type'] == 'good':
                # Good students: mostly consistent, occasional absences
                attendance_prob = base_prob
                if random.random() < 0.05:  # 5% chance of absence
                    attendance_prob = 0.2
                    
            elif student['type'] == 'average':
                # Average students: some irregular patterns
                attendance_prob = base_prob
                # Add irregularity
                if random.random() < 0.15:  # 15% chance of irregular absence
                    attendance_prob = random.uniform(0.1, 0.4)
                    
            else:  # poor
                # Poor students: frequent absences, sometimes long streaks
                attendance_prob = base_prob
                # Add streak behavior
                if consecutive_absent > 0 and random.random() < 0.3:  # Continue streak
                    attendance_prob = 0.1
                elif random.random() < 0.25:  # Start new streak
                    attendance_prob = 0.1
            
            # Determine attendance
            attendance = 1 if random.random() < attendance_prob else 0
            
            # Update counters
            if attendance == 1:
                consecutive_absent = 0
                days_since_last_present = 0
            else:
                consecutive_absent += 1
                days_since_last_present += 1
            
            # Create attendance record
            attendance_records.append({
                'student_id': student['student_id'],
                'student_name': student['student_name'],
                'session_date': session_date.strftime('%Y-%m-%d'),
                'attendance': attendance,
                'days_since_last_present': days_since_last_present,
                'consecutive_absent': consecutive_absent
            })
    
    # Create DataFrame
    df = pd.DataFrame(attendance_records)
    
    # Add some additional features
    # Add attendance percentage per student
    student_stats = df.groupby('student_id')['attendance'].agg(['count', 'sum']).reset_index()
    student_stats['attendance_percentage'] = (student_stats['sum'] / student_stats['count']) * 100
    
    # Merge back to main dataframe
    df = df.merge(student_stats[['student_id', 'attendance_percentage']], on='student_id', how='left')
    
    print(f"Generated {len(df)} attendance records for {len(students)} students")
    print(f"Student distribution:")
    for st in student_types:
        count = len([s for s in students if s['type'] == st['type']])
        print(f"  {st['type'].title()}: {count} students ({count/num_students*100:.1f}%)")
    
    return df

def save_sample_data(df, filename='data/attendance_data.xlsx'):
    """
    Save sample data to Excel file.
    
    Args:
        df (pd.DataFrame): Attendance data
        filename (str): Output filename
    """
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Save to Excel
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        # Main attendance data
        df.to_excel(writer, sheet_name='Attendance_Data', index=False)
        
        # Summary statistics
        summary_data = []
        for student_id in df['student_id'].unique():
            student_data = df[df['student_id'] == student_id]
            total_sessions = len(student_data)
            present_sessions = student_data['attendance'].sum()
            attendance_pct = (present_sessions / total_sessions) * 100
            
            summary_data.append({
                'student_id': student_id,
                'student_name': student_data['student_name'].iloc[0],
                'total_sessions': total_sessions,
                'present_sessions': present_sessions,
                'attendance_percentage': attendance_pct
            })
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
    
    print(f"Sample data saved to {filename}")
    print(f"File contains {len(df)} attendance records across {len(df['student_id'].unique())} students")

def main():
    """Main function to generate sample data."""
    print("=" * 60)
    print("AI Attendance Analytics - Sample Data Generator")
    print("=" * 60)
    
    # Generate sample data
    df = generate_sample_attendance_data(num_students=50, num_days=30)
    
    # Save to Excel
    save_sample_data(df)
    
    print("\n" + "=" * 60)
    print("Sample data generation completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run 'scripts/train_model.bat' to train the ML model")
    print("2. Run 'scripts/run_analysis.bat' to generate predictions and reports")
    print("\nSample data includes:")
    print("• 50 students with varying attendance patterns")
    print("• 30 days of attendance data")
    print("• Realistic scenarios (excellent, good, average, poor attendance)")
    print("• Irregular patterns and absence streaks")

if __name__ == "__main__":
    main()
