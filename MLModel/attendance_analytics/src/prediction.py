"""
Prediction Module for Attendance Analytics

This module handles the prediction and classification of attendance patterns using trained models.
It implements industry-standard prediction practices with proper feature scaling and result interpretation.

Key Features:
- Anomaly detection using trained Isolation Forest
- Attendance performance classification
- Risk assessment and categorization
- Result interpretation and explanation
- Export functionality

Author: ML Engineering Team
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AttendancePredictor:
    """
    Attendance prediction and classification system.
    
    This class handles the prediction of attendance anomalies and classification
    of student attendance performance using trained machine learning models.
    """
    
    def __init__(self, model_dir: str = "models"):
        """
        Initialize the predictor.
        
        Args:
            model_dir (str): Directory containing trained model artifacts
        """
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.metadata = {}
        
        # Load model artifacts
        self.load_model_artifacts()
        
        logger.info("Attendance predictor initialized")
    
    def load_model_artifacts(self) -> bool:
        """
        Load trained model artifacts.
        
        Returns:
            bool: True if loading successful, False otherwise
        """
        try:
            # Load model
            model_path = os.path.join(self.model_dir, "isolation_forest.pkl")
            self.model = joblib.load(model_path)
            
            # Load scaler
            scaler_path = os.path.join(self.model_dir, "scaler.pkl")
            self.scaler = joblib.load(scaler_path)
            
            # Load metadata
            metadata_path = os.path.join(self.model_dir, "metadata.json")
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            
            self.feature_names = self.metadata['feature_names']
            
            logger.info("Model artifacts loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model artifacts: {str(e)}")
            return False
    
    def prepare_prediction_data(self, features_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Prepare data for prediction.
        
        Args:
            features_df (pd.DataFrame): Feature-engineered data
            
        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: Features and identifiers
        """
        logger.info("Preparing data for prediction")
        
        # Separate identifiers from features
        identifier_columns = ['student_id', 'student_name']
        feature_columns = [col for col in features_df.columns if col not in identifier_columns]
        
        # Extract features
        X = features_df[feature_columns].copy()
        identifiers = features_df[identifier_columns].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Ensure feature order matches training data
        X = X[self.feature_names]
        
        logger.info(f"Prediction data prepared with {X.shape[1]} features and {X.shape[0]} samples")
        
        return X, identifiers
    
    def scale_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Scale features using loaded scaler.
        
        Args:
            X (pd.DataFrame): Raw features
            
        Returns:
            pd.DataFrame: Scaled features
        """
        logger.info("Scaling features for prediction")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Convert back to DataFrame
        X_scaled_df = pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
        
        logger.info("Feature scaling completed")
        
        return X_scaled_df
    
    def predict_anomalies(self, X_scaled: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict attendance anomalies using Isolation Forest.
        
        Args:
            X_scaled (pd.DataFrame): Scaled features
            
        Returns:
            Tuple[np.ndarray, np.ndarray]: Predictions and anomaly scores
        """
        logger.info("Predicting attendance anomalies")
        
        # Get predictions
        predictions = self.model.predict(X_scaled)
        
        # Get anomaly scores
        anomaly_scores = self.model.decision_function(X_scaled)
        
        logger.info(f"Anomaly prediction completed. {np.sum(predictions == -1)} anomalies detected")
        
        return predictions, anomaly_scores
    
    def classify_attendance_performance(self, attendance_percentage: float) -> str:
        """
        Classify attendance performance based on percentage.
        
        Args:
            attendance_percentage (float): Attendance percentage
            
        Returns:
            str: Performance category
        """
        if attendance_percentage >= 90:
            return "Excellent"
        elif attendance_percentage >= 75:
            return "Good"
        elif attendance_percentage >= 60:
            return "Average"
        else:
            return "Poor"
    
    def assess_risk_level(self, attendance_percentage: float, anomaly_score: float, risk_score: float) -> str:
        """
        Assess student risk level based on multiple factors.
        
        Args:
            attendance_percentage (float): Attendance percentage
            anomaly_score (float): Anomaly detection score
            risk_score (float): Composite risk score
            
        Returns:
            str: Risk level
        """
        # Primary risk based on attendance percentage
        if attendance_percentage < 60:
            return "High Risk"
        elif attendance_percentage < 75:
            return "At Risk"
        else:
            # Consider anomaly score for borderline cases
            if anomaly_score < -0.1:  # Strong anomaly
                return "Moderate Risk"
            else:
                return "Low Risk"
    
    def generate_predictions(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate complete predictions for all students.
        
        Args:
            features_df (pd.DataFrame): Feature-engineered data
            
        Returns:
            pd.DataFrame: Complete predictions with classifications
        """
        logger.info("Generating complete predictions")
        
        # Prepare data
        X, identifiers = self.prepare_prediction_data(features_df)
        
        # Scale features
        X_scaled = self.scale_features(X)
        
        # Predict anomalies
        predictions, anomaly_scores = self.predict_anomalies(X_scaled)
        
        # Create results dataframe
        results_df = identifiers.copy()
        
        # Add original features
        for col in X.columns:
            results_df[col] = X[col].values
        
        # Add prediction results
        results_df['anomaly_score'] = anomaly_scores
        results_df['anomaly_prediction'] = predictions
        results_df['irregular_flag'] = np.where(predictions == -1, 'Irregular', 'Normal')
        
        # Classify attendance performance
        if 'attendance_percentage' in results_df.columns:
            results_df['attendance_category'] = results_df['attendance_percentage'].apply(
                self.classify_attendance_performance
            )
            
            # Assess risk level
            if 'risk_score' in results_df.columns:
                results_df['risk_level'] = results_df.apply(
                    lambda row: self.assess_risk_level(
                        row['attendance_percentage'],
                        row['anomaly_score'],
                        row['risk_score']
                    ),
                    axis=1
                )
            else:
                results_df['risk_level'] = results_df['attendance_percentage'].apply(
                    lambda x: self.assess_risk_level(x, 0, 0)
                )
        
        # Add confidence scores
        results_df['confidence_score'] = np.abs(anomaly_scores)
        
        logger.info(f"Predictions generated for {len(results_df)} students")
        
        return results_df
    
    def explain_prediction(self, student_data: Dict) -> Dict:
        """
        Explain prediction for a specific student.
        
        Args:
            student_data (Dict): Student data and predictions
            
        Returns:
            Dict: Explanation of prediction
        """
        explanation = {
            'student_id': student_data.get('student_id'),
            'student_name': student_data.get('student_name'),
            'attendance_percentage': student_data.get('attendance_percentage', 0),
            'attendance_category': student_data.get('attendance_category', 'Unknown'),
            'anomaly_score': student_data.get('anomaly_score', 0),
            'irregular_flag': student_data.get('irregular_flag', 'Normal'),
            'risk_level': student_data.get('risk_level', 'Low Risk'),
            'key_factors': [],
            'recommendations': []
        }
        
        # Identify key factors
        attendance_pct = student_data.get('attendance_percentage', 0)
        anomaly_score = student_data.get('anomaly_score', 0)
        
        if attendance_pct < 75:
            explanation['key_factors'].append("Low attendance percentage")
            explanation['recommendations'].append("Improve attendance to meet minimum requirements")
        
        if anomaly_score < -0.1:
            explanation['key_factors'].append("Irregular attendance pattern detected")
            explanation['recommendations'].append("Maintain consistent attendance pattern")
        
        if student_data.get('max_consecutive_absent', 0) > 3:
            explanation['key_factors'].append("Extended absence streaks")
            explanation['recommendations'].append("Avoid prolonged absences")
        
        if student_data.get('attendance_volatility', 0) > 0.5:
            explanation['key_factors'].append("Inconsistent attendance pattern")
            explanation['recommendations'].append("Maintain regular attendance schedule")
        
        return explanation
    
    def export_predictions(self, results_df: pd.DataFrame, output_path: str) -> bool:
        """
        Export predictions to Excel file.
        
        Args:
            results_df (pd.DataFrame): Prediction results
            output_path (str): Output file path
            
        Returns:
            bool: True if export successful, False otherwise
        """
        try:
            logger.info(f"Exporting predictions to {output_path}")
            
            # Create Excel writer with multiple sheets
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                # Main predictions sheet
                results_df.to_excel(writer, sheet_name='Predictions', index=False)
                
                # Summary statistics sheet
                summary_stats = self._generate_summary_statistics(results_df)
                summary_stats.to_excel(writer, sheet_name='Summary', index=False)
                
                # At-risk students sheet
                at_risk_students = results_df[results_df['risk_level'].isin(['High Risk', 'At Risk'])]
                at_risk_students.to_excel(writer, sheet_name='At_Risk_Students', index=False)
                
                # Top performers sheet
                top_performers = results_df[results_df['attendance_category'] == 'Excellent']
                top_performers.to_excel(writer, sheet_name='Top_Performers', index=False)
            
            logger.info(f"Predictions exported successfully to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting predictions: {str(e)}")
            return False
    
    def _generate_summary_statistics(self, results_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate summary statistics from predictions.
        
        Args:
            results_df (pd.DataFrame): Prediction results
            
        Returns:
            pd.DataFrame: Summary statistics
        """
        stats_data = []
        
        # Total students
        stats_data.append({
            'Metric': 'Total Students',
            'Value': len(results_df),
            'Category': 'Overview'
        })
        
        # Attendance statistics
        if 'attendance_percentage' in results_df.columns:
            avg_attendance = results_df['attendance_percentage'].mean()
            stats_data.append({
                'Metric': 'Average Attendance %',
                'Value': f"{avg_attendance:.2f}%",
                'Category': 'Attendance'
            })
        
        # Category distribution
        if 'attendance_category' in results_df.columns:
            category_counts = results_df['attendance_category'].value_counts()
            for category, count in category_counts.items():
                stats_data.append({
                    'Metric': f'{category} Attendance',
                    'Value': count,
                    'Category': 'Categories'
                })
        
        # Risk distribution
        if 'risk_level' in results_df.columns:
            risk_counts = results_df['risk_level'].value_counts()
            for risk, count in risk_counts.items():
                stats_data.append({
                    'Metric': f'{risk} Students',
                    'Value': count,
                    'Category': 'Risk'
                })
        
        # Anomaly statistics
        if 'irregular_flag' in results_df.columns:
            irregular_count = results_df[results_df['irregular_flag'] == 'Irregular'].shape[0]
            stats_data.append({
                'Metric': 'Irregular Patterns',
                'Value': irregular_count,
                'Category': 'Anomalies'
            })
        
        return pd.DataFrame(stats_data)
    
    def get_model_info(self) -> Dict:
        """
        Get information about the loaded model.
        
        Returns:
            Dict: Model information
        """
        if not self.metadata:
            return {'status': 'No model loaded'}
        
        return {
            'status': 'Model loaded',
            'model_type': self.metadata['model_type'],
            'training_date': self.metadata['training_date'],
            'feature_count': len(self.metadata['feature_names']),
            'version': self.metadata['version'],
            'evaluation_metrics': self.metadata.get('evaluation_metrics', {})
        }


# Example usage and testing
if __name__ == "__main__":
    # Example usage
    predictor = AttendancePredictor()
    
    # This would be used with actual feature data
    # features_df = pd.read_csv("features.csv")
    # predictions = predictor.generate_predictions(features_df)
    # predictor.export_predictions(predictions, "outputs/predictions.xlsx")
    
    print("Prediction module loaded successfully!")
