"""
Feature Engineering Module for Attendance Analytics

This module handles the extraction of meaningful behavioral features from raw attendance data.
It implements industry-standard feature engineering practices for attendance pattern analysis.

Key Features:
- Attendance percentage calculation
- Absence streak analysis
- Recency-based indicators
- Behavioral pattern extraction
- Risk assessment features

Author: ML Engineering Team
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AttendanceFeatureEngineer:
    """
    Advanced feature engineering for attendance analytics.
    
    This class transforms raw attendance data into meaningful behavioral features
    that can be used for machine learning models and analytics.
    """
    
    def __init__(self):
        """Initialize the feature engineer with default parameters."""
        self.feature_names = []
        self.risk_threshold = 75.0  # Attendance risk threshold
        
    def load_data(self, file_path: str) -> pd.DataFrame:
        """
        Load attendance data from Excel file.
        
        Args:
            file_path (str): Path to the Excel file
            
        Returns:
            pd.DataFrame: Loaded attendance data
        """
        try:
            logger.info(f"Loading attendance data from {file_path}")
            df = pd.read_excel(file_path)
            
            # Validate required columns
            required_columns = ['student_id', 'student_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
                
            logger.info(f"Loaded {len(df)} attendance records")
            return df
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess raw attendance data.
        
        Args:
            df (pd.DataFrame): Raw attendance data
            
        Returns:
            pd.DataFrame: Preprocessed data
        """
        logger.info("Preprocessing attendance data")
        
        # Make a copy to avoid modifying original data
        df = df.copy()
        
        # Convert date columns to datetime
        date_columns = ['session_date', 'date']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Handle missing values
        if 'attendance' in df.columns:
            df['attendance'] = df['attendance'].fillna(0)
        
        # Sort by student and date for proper feature calculation
        sort_columns = ['student_id']
        if 'session_date' in df.columns:
            sort_columns.append('session_date')
        elif 'date' in df.columns:
            sort_columns.append('date')
            
        df = df.sort_values(sort_columns)
        
        logger.info("Data preprocessing completed")
        return df
    
    def calculate_attendance_percentage(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate attendance percentage for each student.
        
        Args:
            df (pd.DataFrame): Preprocessed attendance data
            
        Returns:
            pd.DataFrame: Data with attendance percentage
        """
        logger.info("Calculating attendance percentage")
        
        # Group by student
        student_stats = []
        
        for student_id, group in df.groupby('student_id'):
            total_sessions = len(group)
            present_sessions = group['attendance'].sum() if 'attendance' in group.columns else 0
            
            # Calculate percentage
            attendance_percentage = (present_sessions / total_sessions * 100) if total_sessions > 0 else 0
            
            student_stats.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'total_sessions': total_sessions,
                'present_sessions': present_sessions,
                'attendance_percentage': attendance_percentage
            })
        
        result_df = pd.DataFrame(student_stats)
        logger.info(f"Calculated attendance for {len(result_df)} students")
        
        return result_df
    
    def calculate_absence_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate absence patterns and streaks.
        
        Args:
            df (pd.DataFrame): Preprocessed attendance data
            
        Returns:
            pd.DataFrame: Data with absence patterns
        """
        logger.info("Calculating absence patterns")
        
        pattern_data = []
        
        for student_id, group in df.groupby('student_id'):
            # Sort by date
            if 'session_date' in group.columns:
                group = group.sort_values('session_date')
            elif 'date' in group.columns:
                group = group.sort_values('date')
            
            attendance_values = group['attendance'].values if 'attendance' in group.columns else []
            
            # Calculate consecutive absences
            consecutive_absent = 0
            max_consecutive_absent = 0
            absence_streaks = []
            
            for attendance in attendance_values:
                if attendance == 0:  # Absent
                    consecutive_absent += 1
                    max_consecutive_absent = max(max_consecutive_absent, consecutive_absent)
                else:  # Present
                    if consecutive_absent > 0:
                        absence_streaks.append(consecutive_absent)
                    consecutive_absent = 0
            
            # Add final streak if ended with absence
            if consecutive_absent > 0:
                absence_streaks.append(consecutive_absent)
            
            # Calculate pattern metrics
            avg_absence_streak = np.mean(absence_streaks) if absence_streaks else 0
            total_absence_streaks = len(absence_streaks)
            
            # Calculate days since last present
            days_since_last_present = 0
            if 'session_date' in group.columns:
                last_present_date = group[group['attendance'] == 1]['session_date'].max()
                if pd.notna(last_present_date):
                    days_since_last_present = (datetime.now() - last_present_date).days
            elif 'date' in group.columns:
                last_present_date = group[group['attendance'] == 1]['date'].max()
                if pd.notna(last_present_date):
                    days_since_last_present = (datetime.now() - last_present_date).days
            
            pattern_data.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'consecutive_absent': consecutive_absent,
                'max_consecutive_absent': max_consecutive_absent,
                'avg_absence_streak': avg_absence_streak,
                'total_absence_streaks': total_absence_streaks,
                'days_since_last_present': days_since_last_present
            })
        
        pattern_df = pd.DataFrame(pattern_data)
        logger.info(f"Calculated absence patterns for {len(pattern_df)} students")
        
        return pattern_df
    
    def calculate_behavioral_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate advanced behavioral features.
        
        Args:
            df (pd.DataFrame): Preprocessed attendance data
            
        Returns:
            pd.DataFrame: Data with behavioral features
        """
        logger.info("Calculating behavioral features")
        
        behavioral_data = []
        
        for student_id, group in df.groupby('student_id'):
            attendance_values = group['attendance'].values if 'attendance' in group.columns else []
            
            if len(attendance_values) == 0:
                continue
            
            # Attendance consistency (standard deviation)
            attendance_consistency = np.std(attendance_values) if len(attendance_values) > 1 else 0
            
            # Attendance volatility (coefficient of variation)
            attendance_mean = np.mean(attendance_values)
            attendance_volatility = (np.std(attendance_values) / attendance_mean) if attendance_mean > 0 else 0
            
            # Recent attendance trend (last 5 sessions)
            recent_attendance = attendance_values[-5:] if len(attendance_values) >= 5 else attendance_values
            recent_attendance_rate = np.mean(recent_attendance) * 100
            
            # Attendance improvement/decline
            if len(attendance_values) >= 10:
                first_half = attendance_values[:len(attendance_values)//2]
                second_half = attendance_values[len(attendance_values)//2:]
                attendance_trend = np.mean(second_half) - np.mean(first_half)
            else:
                attendance_trend = 0
            
            # Irregularity score (based on attendance patterns)
            irregularity_score = self._calculate_irregularity_score(attendance_values)
            
            # Risk score (composite risk assessment)
            risk_score = self._calculate_risk_score(attendance_values, attendance_consistency, irregularity_score)
            
            behavioral_data.append({
                'student_id': student_id,
                'student_name': group['student_name'].iloc[0],
                'attendance_consistency': attendance_consistency,
                'attendance_volatility': attendance_volatility,
                'recent_attendance_rate': recent_attendance_rate,
                'attendance_trend': attendance_trend,
                'irregularity_score': irregularity_score,
                'risk_score': risk_score
            })
        
        behavioral_df = pd.DataFrame(behavioral_data)
        logger.info(f"Calculated behavioral features for {len(behavioral_df)} students")
        
        return behavioral_df
    
    def _calculate_irregularity_score(self, attendance_values: np.ndarray) -> float:
        """
        Calculate irregularity score based on attendance patterns.
        
        Args:
            attendance_values (np.ndarray): Array of attendance values
            
        Returns:
            float: Irregularity score (0-1)
        """
        if len(attendance_values) < 3:
            return 0.0
        
        # Calculate pattern irregularity
        irregularity = 0.0
        
        # Check for alternating patterns
        for i in range(len(attendance_values) - 2):
            if attendance_values[i] != attendance_values[i+1] and attendance_values[i+1] != attendance_values[i+2]:
                irregularity += 1
        
        # Normalize by length
        irregularity_score = min(irregularity / len(attendance_values), 1.0)
        
        return irregularity_score
    
    def _calculate_risk_score(self, attendance_values: np.ndarray, consistency: float, irregularity: float) -> float:
        """
        Calculate composite risk score.
        
        Args:
            attendance_values (np.ndarray): Array of attendance values
            consistency (float): Attendance consistency
            irregularity (float): Irregularity score
            
        Returns:
            float: Risk score (0-1)
        """
        attendance_rate = np.mean(attendance_values)
        
        # Base risk from attendance rate
        attendance_risk = max(0, (75 - attendance_rate * 100) / 75)
        
        # Risk from inconsistency
        consistency_risk = min(consistency * 2, 1.0)
        
        # Risk from irregularity
        irregularity_risk = irregularity
        
        # Composite risk score
        risk_score = (attendance_risk * 0.5 + consistency_risk * 0.3 + irregularity_risk * 0.2)
        
        return min(risk_score, 1.0)
    
    def extract_features(self, file_path: str) -> pd.DataFrame:
        """
        Main method to extract all features from attendance data.
        
        Args:
            file_path (str): Path to the attendance data file
            
        Returns:
            pd.DataFrame: Feature-engineered data
        """
        logger.info("Starting feature extraction process")
        
        # Load and preprocess data
        raw_data = self.load_data(file_path)
        processed_data = self.preprocess_data(raw_data)
        
        # Calculate different feature sets
        attendance_stats = self.calculate_attendance_percentage(processed_data)
        absence_patterns = self.calculate_absence_patterns(processed_data)
        behavioral_features = self.calculate_behavioral_features(processed_data)
        
        # Merge all features
        features_df = attendance_stats.merge(absence_patterns, on=['student_id', 'student_name'], how='left')
        features_df = features_df.merge(behavioral_features, on=['student_id', 'student_name'], how='left')
        
        # Fill missing values
        features_df = features_df.fillna(0)
        
        # Store feature names for later use
        self.feature_names = [col for col in features_df.columns if col not in ['student_id', 'student_name']]
        
        logger.info(f"Feature extraction completed. Total features: {len(self.feature_names)}")
        
        return features_df
    
    def get_feature_names(self) -> List[str]:
        """
        Get the list of feature names.
        
        Returns:
            List[str]: List of feature names
        """
        return self.feature_names


# Example usage and testing
if __name__ == "__main__":
    # Example usage
    engineer = AttendanceFeatureEngineer()
    
    # This would be used with actual data
    # features = engineer.extract_features("data/sample_attendance.xlsx")
    # print(features.head())
    
    print("Attendance Feature Engineering module loaded successfully!")
