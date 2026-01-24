"""
Analytics Module for Attendance Analytics

This module handles the generation of insights, recommendations, and analytics from attendance data.
It implements rule-based logic for generating actionable insights without using external AI services.

Key Features:
- Batch-level analytics computation
- AI-style insights generation
- Risk assessment and recommendations
- Performance distribution analysis
- Actionable recommendations engine

Author: ML Engineering Team
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AttendanceAnalytics:
    """
    Attendance analytics and insights generator.
    
    This class processes attendance predictions to generate meaningful insights,
    recommendations, and analytics for educational institutions.
    """
    
    def __init__(self):
        """Initialize the analytics engine."""
        self.insights_rules = self._initialize_insights_rules()
        self.recommendations_rules = self._initialize_recommendations_rules()
        
        logger.info("Attendance analytics engine initialized")
    
    def _initialize_insights_rules(self) -> Dict:
        """
        Initialize rule-based insights generation.
        
        Returns:
            Dict: Insights generation rules
        """
        return {
            'attendance_health': {
                'excellent': {'threshold': 90, 'insight': "Outstanding attendance performance with excellent student engagement"},
                'good': {'threshold': 75, 'insight': "Good attendance performance indicating satisfactory student engagement"},
                'concerning': {'threshold': 60, 'insight': "Attendance levels require attention and intervention"},
                'critical': {'threshold': 0, 'insight': "Critical attendance situation requiring immediate action"}
            },
            'anomaly_patterns': {
                'high_anomaly': {'threshold': 0.15, 'insight': "High number of irregular attendance patterns detected"},
                'moderate_anomaly': {'threshold': 0.10, 'insight': "Moderate irregular attendance patterns present"},
                'low_anomaly': {'threshold': 0.05, 'insight': "Generally stable attendance patterns"}
            },
            'risk_assessment': {
                'high_risk': {'threshold': 0.20, 'insight': "Significant portion of students at high risk of academic issues"},
                'moderate_risk': {'threshold': 0.10, 'insight': "Moderate number of students requiring attention"},
                'low_risk': {'threshold': 0.05, 'insight': "Low risk levels across student population"}
            }
        }
    
    def _initialize_recommendations_rules(self) -> Dict:
        """
        Initialize rule-based recommendations generation.
        
        Returns:
            Dict: Recommendations generation rules
        """
        return {
            'attendance_improvement': {
                'poor_attendance': [
                    "Implement attendance monitoring system with daily alerts",
                    "Conduct counseling sessions for consistently absent students",
                    "Introduce incentive programs for regular attendance",
                    "Engage parents/guardians in attendance improvement initiatives"
                ],
                'average_attendance': [
                    "Provide additional academic support to boost engagement",
                    "Implement peer mentoring programs",
                    "Create interactive and engaging learning experiences",
                    "Regular feedback and progress monitoring"
                ],
                'good_attendance': [
                    "Maintain current positive trends",
                    "Recognize and reward consistent attendance",
                    "Provide leadership opportunities",
                    "Encourage peer support initiatives"
                ]
            },
            'anomaly_handling': {
                'high_anomaly': [
                    "Investigate underlying causes of irregular patterns",
                    "Implement personalized attendance plans",
                    "Regular monitoring and intervention",
                    "Collaborate with support services"
                ],
                'moderate_anomaly': [
                    "Monitor attendance patterns closely",
                    "Provide early intervention support",
                    "Implement check-in systems",
                    "Encourage peer support"
                ]
            },
            'institutional_improvements': [
                "Review and optimize class scheduling",
                "Improve communication with students",
                "Enhance teaching methodologies",
                "Implement student feedback systems",
                "Provide professional development for faculty"
            ]
        }
    
    def compute_batch_analytics(self, predictions_df: pd.DataFrame) -> Dict:
        """
        Compute comprehensive batch-level analytics.
        
        Args:
            predictions_df (pd.DataFrame): Prediction results
            
        Returns:
            Dict: Batch analytics
        """
        logger.info("Computing batch-level analytics")
        
        analytics = {
            'overview': {},
            'attendance_distribution': {},
            'risk_analysis': {},
            'anomaly_analysis': {},
            'performance_metrics': {}
        }
        
        # Overview statistics
        total_students = len(predictions_df)
        analytics['overview'] = {
            'total_students': total_students,
            'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data_completeness': f"{(predictions_df.notna().sum().sum() / (total_students * len(predictions_df.columns)) * 100):.1f}%"
        }
        
        # Attendance distribution
        if 'attendance_percentage' in predictions_df.columns:
            attendance_stats = predictions_df['attendance_percentage'].describe()
            analytics['overview']['overall_average_attendance'] = f"{attendance_stats['mean']:.2f}%"
            analytics['overview']['attendance_std'] = f"{attendance_stats['std']:.2f}%"
            
            # Category distribution
            if 'attendance_category' in predictions_df.columns:
                category_counts = predictions_df['attendance_category'].value_counts()
                analytics['attendance_distribution'] = {
                    category: {
                        'count': count,
                        'percentage': f"{(count / total_students * 100):.1f}%"
                    }
                    for category, count in category_counts.items()
                }
        
        # Risk analysis
        if 'risk_level' in predictions_df.columns:
            risk_counts = predictions_df['risk_level'].value_counts()
            at_risk_count = risk_counts.get('At Risk', 0) + risk_counts.get('High Risk', 0)
            
            analytics['risk_analysis'] = {
                'at_risk_students': at_risk_count,
                'at_risk_percentage': f"{(at_risk_count / total_students * 100):.1f}%",
                'risk_distribution': {
                    risk: {
                        'count': count,
                        'percentage': f"{(count / total_students * 100):.1f}%"
                    }
                    for risk, count in risk_counts.items()
                }
            }
        
        # Anomaly analysis
        if 'irregular_flag' in predictions_df.columns:
            irregular_count = predictions_df[predictions_df['irregular_flag'] == 'Irregular'].shape[0]
            analytics['anomaly_analysis'] = {
                'irregular_patterns': irregular_count,
                'irregular_percentage': f"{(irregular_count / total_students * 100):.1f}%",
                'normal_patterns': total_students - irregular_count
            }
        
        # Performance metrics
        if 'attendance_percentage' in predictions_df.columns:
            analytics['performance_metrics'] = {
                'top_performers': predictions_df[predictions_df['attendance_percentage'] >= 90].shape[0],
                'satisfactory_performers': predictions_df[
                    (predictions_df['attendance_percentage'] >= 75) & 
                    (predictions_df['attendance_percentage'] < 90)
                ].shape[0],
                'needs_improvement': predictions_df[predictions_df['attendance_percentage'] < 75].shape[0]
            }
        
        logger.info("Batch analytics computation completed")
        return analytics
    
    def generate_insights(self, analytics: Dict) -> List[Dict]:
        """
        Generate AI-style insights using rule-based logic.
        
        Args:
            analytics (Dict): Batch analytics
            
        Returns:
            List[Dict]: Generated insights
        """
        logger.info("Generating AI-style insights")
        
        insights = []
        
        # Attendance health insights
        avg_attendance = float(analytics['overview'].get('overall_average_attendance', '0%').replace('%', ''))
        
        if avg_attendance >= 90:
            insights.append({
                'category': 'Attendance Health',
                'type': 'positive',
                'insight': self.insights_rules['attendance_health']['excellent']['insight'],
                'supporting_data': f"Average attendance: {avg_attendance:.1f}%"
            })
        elif avg_attendance >= 75:
            insights.append({
                'category': 'Attendance Health',
                'type': 'moderate',
                'insight': self.insights_rules['attendance_health']['good']['insight'],
                'supporting_data': f"Average attendance: {avg_attendance:.1f}%"
            })
        elif avg_attendance >= 60:
            insights.append({
                'category': 'Attendance Health',
                'type': 'concerning',
                'insight': self.insights_rules['attendance_health']['concerning']['insight'],
                'supporting_data': f"Average attendance: {avg_attendance:.1f}%"
            })
        else:
            insights.append({
                'category': 'Attendance Health',
                'type': 'critical',
                'insight': self.insights_rules['attendance_health']['critical']['insight'],
                'supporting_data': f"Average attendance: {avg_attendance:.1f}%"
            })
        
        # Anomaly pattern insights
        irregular_percentage = float(analytics['anomaly_analysis'].get('irregular_percentage', '0%').replace('%', ''))
        
        if irregular_percentage >= 15:
            insights.append({
                'category': 'Pattern Analysis',
                'type': 'warning',
                'insight': self.insights_rules['anomaly_patterns']['high_anomaly']['insight'],
                'supporting_data': f"Irregular patterns: {irregular_percentage:.1f}%"
            })
        elif irregular_percentage >= 10:
            insights.append({
                'category': 'Pattern Analysis',
                'type': 'moderate',
                'insight': self.insights_rules['anomaly_patterns']['moderate_anomaly']['insight'],
                'supporting_data': f"Irregular patterns: {irregular_percentage:.1f}%"
            })
        else:
            insights.append({
                'category': 'Pattern Analysis',
                'type': 'positive',
                'insight': self.insights_rules['anomaly_patterns']['low_anomaly']['insight'],
                'supporting_data': f"Irregular patterns: {irregular_percentage:.1f}%"
            })
        
        # Risk assessment insights
        at_risk_percentage = float(analytics['risk_analysis'].get('at_risk_percentage', '0%').replace('%', ''))
        
        if at_risk_percentage >= 20:
            insights.append({
                'category': 'Risk Assessment',
                'type': 'critical',
                'insight': self.insights_rules['risk_assessment']['high_risk']['insight'],
                'supporting_data': f"At-risk students: {at_risk_percentage:.1f}%"
            })
        elif at_risk_percentage >= 10:
            insights.append({
                'category': 'Risk Assessment',
                'type': 'concerning',
                'insight': self.insights_rules['risk_assessment']['moderate_risk']['insight'],
                'supporting_data': f"At-risk students: {at_risk_percentage:.1f}%"
            })
        else:
            insights.append({
                'category': 'Risk Assessment',
                'type': 'positive',
                'insight': self.insights_rules['risk_assessment']['low_risk']['insight'],
                'supporting_data': f"At-risk students: {at_risk_percentage:.1f}%"
            })
        
        # Performance distribution insights
        if 'performance_metrics' in analytics:
            top_performers = analytics['performance_metrics']['top_performers']
            total_students = analytics['overview']['total_students']
            
            if top_performers / total_students >= 0.3:
                insights.append({
                    'category': 'Performance',
                    'type': 'positive',
                    'insight': "Strong performance culture with high number of top performers",
                    'supporting_data': f"Top performers: {top_performers} ({(top_performers/total_students*100):.1f}%)"
                })
            elif top_performers / total_students >= 0.15:
                insights.append({
                    'category': 'Performance',
                    'type': 'moderate',
                    'insight': "Moderate performance with room for improvement",
                    'supporting_data': f"Top performers: {top_performers} ({(top_performers/total_students*100):.1f}%)"
                })
            else:
                insights.append({
                    'category': 'Performance',
                    'type': 'concerning',
                    'insight': "Low number of top performers indicating need for academic support",
                    'supporting_data': f"Top performers: {top_performers} ({(top_performers/total_students*100):.1f}%)"
                })
        
        logger.info(f"Generated {len(insights)} insights")
        return insights
    
    def generate_recommendations(self, analytics: Dict, insights: List[Dict]) -> List[Dict]:
        """
        Generate actionable recommendations based on analytics and insights.
        
        Args:
            analytics (Dict): Batch analytics
            insights (List[Dict]): Generated insights
            
        Returns:
            List[Dict]: Actionable recommendations
        """
        logger.info("Generating actionable recommendations")
        
        recommendations = []
        
        # Analyze insights to determine recommendations
        critical_insights = [insight for insight in insights if insight['type'] == 'critical']
        concerning_insights = [insight for insight in insights if insight['type'] == 'concerning']
        moderate_insights = [insight for insight in insights if insight['type'] == 'moderate']
        
        # Attendance-based recommendations
        avg_attendance = float(analytics['overview'].get('overall_average_attendance', '0%').replace('%', ''))
        
        if avg_attendance < 60:
            recommendations.extend([
                {
                    'priority': 'high',
                    'category': 'Attendance Improvement',
                    'recommendation': "Implement immediate attendance intervention program",
                    'action_items': [
                        "Daily attendance monitoring with alerts",
                        "Individual counseling for absent students",
                        "Parent/guardian engagement initiatives",
                        "Attendance improvement incentive programs"
                    ]
                }
            ])
        elif avg_attendance < 75:
            recommendations.extend([
                {
                    'priority': 'medium',
                    'category': 'Attendance Improvement',
                    'recommendation': "Enhance student engagement and support systems",
                    'action_items': [
                        "Interactive teaching methodologies",
                        "Peer mentoring programs",
                        "Regular progress monitoring",
                        "Student feedback systems"
                    ]
                }
            ])
        
        # Risk-based recommendations
        at_risk_percentage = float(analytics['risk_analysis'].get('at_risk_percentage', '0%').replace('%', ''))
        
        if at_risk_percentage >= 20:
            recommendations.append({
                'priority': 'high',
                'category': 'Risk Management',
                'recommendation': "Implement comprehensive student support program",
                'action_items': [
                    "Early warning system for at-risk students",
                    "Personalized academic support plans",
                    "Regular monitoring and intervention",
                    "Collaboration with support services"
                ]
            })
        
        # Anomaly-based recommendations
        irregular_percentage = float(analytics['anomaly_analysis'].get('irregular_percentage', '0%').replace('%', ''))
        
        if irregular_percentage >= 15:
            recommendations.append({
                'priority': 'medium',
                'category': 'Pattern Management',
                'recommendation': "Address irregular attendance patterns",
                'action_items': [
                    "Investigate underlying causes",
                    "Implement personalized attendance plans",
                    "Regular check-in systems",
                    "Peer support initiatives"
                ]
            })
        
        # Performance-based recommendations
        if 'performance_metrics' in analytics:
            top_performers = analytics['performance_metrics']['top_performers']
            total_students = analytics['overview']['total_students']
            
            if top_performers / total_students < 0.15:
                recommendations.append({
                    'priority': 'medium',
                    'category': 'Performance Enhancement',
                    'recommendation': "Improve overall academic performance",
                    'action_items': [
                        "Enhance teaching methodologies",
                        "Provide additional academic support",
                        "Implement professional development for faculty",
                        "Create engaging learning experiences"
                    ]
                })
        
        # Institutional improvements (always include)
        recommendations.append({
            'priority': 'low',
            'category': 'Institutional Excellence',
            'recommendation': "Continuous improvement initiatives",
            'action_items': self.recommendations_rules['institutional_improvements']
        })
        
        # Recognition for good performance
        if avg_attendance >= 85 and at_risk_percentage < 10:
            recommendations.append({
                'priority': 'low',
                'category': 'Recognition',
                'recommendation': "Recognize and celebrate excellent attendance",
                'action_items': [
                    "Attendance awards and certificates",
                    "Public recognition of top performers",
                    "Create attendance hall of fame",
                    "Share best practices with other institutions"
                ]
            })
        
        logger.info(f"Generated {len(recommendations)} recommendations")
        return recommendations
    
    def identify_student_groups(self, predictions_df: pd.DataFrame) -> Dict:
        """
        Identify different student groups for targeted interventions.
        
        Args:
            predictions_df (pd.DataFrame): Prediction results
            
        Returns:
            Dict: Student groups analysis
        """
        logger.info("Identifying student groups")
        
        groups = {
            'top_performers': [],
            'at_risk_students': [],
            'irregular_patterns': [],
            'needs_attention': []
        }
        
        # Top performers (>=90% attendance)
        if 'attendance_percentage' in predictions_df.columns:
            top_performers_df = predictions_df[predictions_df['attendance_percentage'] >= 90]
            groups['top_performers'] = top_performers_df[['student_id', 'student_name', 'attendance_percentage']].to_dict('records')
        
        # At-risk students (<75% attendance)
        if 'attendance_percentage' in predictions_df.columns:
            at_risk_df = predictions_df[predictions_df['attendance_percentage'] < 75]
            groups['at_risk_students'] = at_risk_df[['student_id', 'student_name', 'attendance_percentage', 'risk_level']].to_dict('records')
        
        # Irregular patterns
        if 'irregular_flag' in predictions_df.columns:
            irregular_df = predictions_df[predictions_df['irregular_flag'] == 'Irregular']
            groups['irregular_patterns'] = irregular_df[['student_id', 'student_name', 'anomaly_score', 'irregular_flag']].to_dict('records')
        
        # Needs attention (combination of factors)
        needs_attention_df = predictions_df[
            (predictions_df['attendance_percentage'] < 75) |
            (predictions_df['irregular_flag'] == 'Irregular') |
            (predictions_df['risk_level'].isin(['High Risk', 'At Risk']))
        ]
        groups['needs_attention'] = needs_attention_df[['student_id', 'student_name', 'attendance_percentage', 'risk_level', 'irregular_flag']].to_dict('records')
        
        logger.info(f"Identified student groups: {len(groups['top_performers'])} top performers, {len(groups['at_risk_students'])} at-risk")
        
        return groups
    
    def generate_complete_analytics(self, predictions_df: pd.DataFrame) -> Dict:
        """
        Generate complete analytics package.
        
        Args:
            predictions_df (pd.DataFrame): Prediction results
            
        Returns:
            Dict: Complete analytics package
        """
        logger.info("Generating complete analytics package")
        
        # Compute batch analytics
        analytics = self.compute_batch_analytics(predictions_df)
        
        # Generate insights
        insights = self.generate_insights(analytics)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(analytics, insights)
        
        # Identify student groups
        student_groups = self.identify_student_groups(predictions_df)
        
        # Complete analytics package
        complete_analytics = {
            'analytics': analytics,
            'insights': insights,
            'recommendations': recommendations,
            'student_groups': student_groups,
            'generation_timestamp': datetime.now().isoformat(),
            'analytics_version': '1.0.0'
        }
        
        logger.info("Complete analytics package generated successfully")
        return complete_analytics


# Example usage and testing
if __name__ == "__main__":
    # Example usage
    analytics = AttendanceAnalytics()
    
    # This would be used with actual prediction data
    # predictions_df = pd.read_csv("predictions.csv")
    # complete_analytics = analytics.generate_complete_analytics(predictions_df)
    # print(complete_analytics)
    
    print("Analytics module loaded successfully!")
