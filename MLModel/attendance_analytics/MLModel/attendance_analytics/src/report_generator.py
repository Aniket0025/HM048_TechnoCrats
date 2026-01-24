"""
Report Generator Module for Attendance Analytics

This module handles the generation of professional HTML reports for attendance analytics.
It uses Jinja2 templating to create responsive, visually appealing reports with charts and insights.

Key Features:
- Professional HTML report generation
- Responsive design with CSS styling
- Interactive charts and visualizations
- Comprehensive analytics display
- Template-based report generation

Author: ML Engineering Team
"""

import pandas as pd
import numpy as np
from jinja2 import Template, Environment, BaseLoader
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import base64
from io import BytesIO
import matplotlib.pyplot as plt
import seaborn as sns
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AttendanceReportGenerator:
    """
    Professional HTML report generator for attendance analytics.
    
    This class creates comprehensive, visually appealing HTML reports
    with charts, insights, and actionable recommendations.
    """
    
    def __init__(self, template_dir: str = "templates"):
        """
        Initialize the report generator.
        
        Args:
            template_dir (str): Directory containing HTML templates
        """
        self.template_dir = template_dir
        self.template_env = Environment(loader=BaseLoader())
        
        # Create template directory if it doesn't exist
        os.makedirs(template_dir, exist_ok=True)
        
        # Set up matplotlib for non-interactive use
        plt.switch_backend('Agg')
        sns.set_style("whitegrid")
        
        logger.info("Report generator initialized")
    
    def create_chart_base64(self, chart_type: str, data: Dict, figsize: tuple = (8, 6)) -> str:
        """
        Create a chart and return it as base64 encoded image.
        
        Args:
            chart_type (str): Type of chart to create
            data (Dict): Chart data
            figsize (tuple): Figure size
            
        Returns:
            str: Base64 encoded image
        """
        try:
            fig, ax = plt.subplots(figsize=figsize)
            
            if chart_type == 'pie':
                # Pie chart
                labels = data.get('labels', [])
                values = data.get('values', [])
                colors = data.get('colors', ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
                
                wedges, texts, autotexts = ax.pie(values, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
                ax.set_title(data.get('title', ''), fontsize=14, fontweight='bold')
                
            elif chart_type == 'bar':
                # Bar chart
                categories = data.get('categories', [])
                values = data.get('values', [])
                colors = data.get('colors', ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
                
                bars = ax.bar(categories, values, color=colors)
                ax.set_title(data.get('title', ''), fontsize=14, fontweight='bold')
                ax.set_ylabel(data.get('ylabel', 'Count'))
                
                # Add value labels on bars
                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                           f'{int(height)}', ha='center', va='bottom')
                
            elif chart_type == 'column':
                # Column chart (vertical bar)
                categories = data.get('categories', [])
                values = data.get('values', [])
                colors = data.get('colors', ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
                
                bars = ax.bar(categories, values, color=colors)
                ax.set_title(data.get('title', ''), fontsize=14, fontweight='bold')
                ax.set_xlabel(data.get('xlabel', 'Categories'))
                ax.set_ylabel(data.get('ylabel', 'Count'))
                
                # Add value labels on bars
                for bar in bars:
                    height = bar.get_height()
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                           f'{int(height)}', ha='center', va='bottom')
            
            elif chart_type == 'line':
                # Line chart
                x_values = data.get('x_values', [])
                y_values = data.get('y_values', [])
                
                ax.plot(x_values, y_values, marker='o', linewidth=2, markersize=6, color='#4ECDC4')
                ax.set_title(data.get('title', ''), fontsize=14, fontweight='bold')
                ax.set_xlabel(data.get('xlabel', 'X-axis'))
                ax.set_ylabel(data.get('ylabel', 'Y-axis'))
                ax.grid(True, alpha=0.3)
            
            # Adjust layout
            plt.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            logger.error(f"Error creating chart: {str(e)}")
            return ""
    
    def generate_attendance_charts(self, analytics: Dict) -> Dict:
        """
        Generate all attendance-related charts.
        
        Args:
            analytics (Dict): Analytics data
            
        Returns:
            Dict: Base64 encoded charts
        """
        logger.info("Generating attendance charts")
        
        charts = {}
        
        # Attendance distribution pie chart
        if 'attendance_distribution' in analytics:
            categories = list(analytics['attendance_distribution'].keys())
            values = [analytics['attendance_distribution'][cat]['count'] for cat in categories]
            
            charts['attendance_pie'] = self.create_chart_base64('pie', {
                'title': 'Attendance Distribution',
                'labels': categories,
                'values': values
            })
        
        # Risk distribution bar chart
        if 'risk_analysis' in analytics and 'risk_distribution' in analytics['risk_analysis']:
            risk_data = analytics['risk_analysis']['risk_distribution']
            categories = list(risk_data.keys())
            values = [risk_data[cat]['count'] for cat in categories]
            
            charts['risk_bar'] = self.create_chart_base64('bar', {
                'title': 'Risk Level Distribution',
                'categories': categories,
                'values': values
            })
        
        # Performance metrics column chart
        if 'performance_metrics' in analytics:
            perf_data = analytics['performance_metrics']
            categories = ['Top Performers', 'Satisfactory', 'Needs Improvement']
            values = [perf_data['top_performers'], perf_data['satisfactory_performers'], perf_data['needs_improvement']]
            
            charts['performance_column'] = self.create_chart_base64('column', {
                'title': 'Performance Distribution',
                'categories': categories,
                'values': values
            })
        
        # Anomaly analysis chart
        if 'anomaly_analysis' in analytics:
            anomaly_data = analytics['anomaly_analysis']
            categories = ['Normal', 'Irregular']
            values = [anomaly_data['normal_patterns'], anomaly_data['irregular_patterns']]
            
            charts['anomaly_bar'] = self.create_chart_base64('column', {
                'title': 'Attendance Pattern Analysis',
                'categories': categories,
                'values': values
            })
        
        logger.info(f"Generated {len(charts)} charts")
        return charts
    
    def create_html_template(self) -> str:
        """
        Create the HTML template for the report.
        
        Returns:
            str: HTML template
        """
        template_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Analytics Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .info-item {
            text-align: center;
            padding: 10px;
        }
        
        .info-item h3 {
            color: #3498db;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        
        .info-item p {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #2c3e50;
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 2.5em;
            font-weight: 700;
            color: #3498db;
            margin-bottom: 10px;
        }
        
        .stat-card .label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #2c3e50;
            font-size: 1.8em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            text-align: center;
        }
        
        .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .insights-grid {
            display: grid;
            gap: 20px;
        }
        
        .insight-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
        }
        
        .insight-card.positive {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        
        .insight-card.moderate {
            background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
        }
        
        .insight-card.concerning {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        }
        
        .insight-card.critical {
            background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
        }
        
        .insight-card h4 {
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        
        .insight-card p {
            font-size: 0.95em;
            line-height: 1.5;
        }
        
        .recommendations-list {
            list-style: none;
        }
        
        .recommendation-item {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .recommendation-item.high {
            border-left-color: #e74c3c;
        }
        
        .recommendation-item.medium {
            border-left-color: #f39c12;
        }
        
        .recommendation-item.low {
            border-left-color: #27ae60;
        }
        
        .recommendation-item h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .recommendation-item .priority {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            color: white;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        
        .recommendation-item.high .priority {
            background: #e74c3c;
        }
        
        .recommendation-item.medium .priority {
            background: #f39c12;
        }
        
        .recommendation-item.low .priority {
            background: #27ae60;
        }
        
        .action-items {
            list-style: none;
            margin-top: 10px;
        }
        
        .action-items li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .action-items li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
        }
        
        .student-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .student-table th,
        .student-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .student-table th {
            background: #3498db;
            color: white;
            font-weight: 600;
        }
        
        .student-table tr:hover {
            background: #f8f9fa;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .badge.excellent {
            background: #27ae60;
            color: white;
        }
        
        .badge.good {
            background: #3498db;
            color: white;
        }
        
        .badge.average {
            background: #f39c12;
            color: white;
        }
        
        .badge.poor {
            background: #e74c3c;
            color: white;
        }
        
        .badge.high-risk {
            background: #c0392b;
            color: white;
        }
        
        .badge.at-risk {
            background: #e67e22;
            color: white;
        }
        
        .badge.low-risk {
            background: #27ae60;
            color: white;
        }
        
        .footer {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .header-info {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>📊 Attendance Analytics Report</h1>
            <div class="subtitle">Intelligent Attendance Analysis & Insights</div>
            <div class="header-info">
                <div class="info-item">
                    <h3>Institute</h3>
                    <p>{{ institute_name }}</p>
                </div>
                <div class="info-item">
                    <h3>Department</h3>
                    <p>{{ department }}</p>
                </div>
                <div class="info-item">
                    <h3>Academic Year</h3>
                    <p>{{ academic_year }}</p>
                </div>
                <div class="info-item">
                    <h3>Division</h3>
                    <p>{{ division }}</p>
                </div>
                <div class="info-item">
                    <h3>Generated On</h3>
                    <p>{{ generation_date }}</p>
                </div>
            </div>
        </div>

        <!-- Statistics Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Students</h3>
                <div class="value">{{ analytics.overview.total_students }}</div>
                <div class="label">Enrolled Students</div>
            </div>
            <div class="stat-card">
                <h3>Average Attendance</h3>
                <div class="value">{{ analytics.overview.overall_average_attendance }}</div>
                <div class="label">Overall Performance</div>
            </div>
            <div class="stat-card">
                <h3>At-Risk Students</h3>
                <div class="value">{{ analytics.risk_analysis.at_risk_percentage }}</div>
                <div class="label">Require Intervention</div>
            </div>
            <div class="stat-card">
                <h3>Irregular Patterns</h3>
                <div class="value">{{ analytics.anomaly_analysis.irregular_percentage }}</div>
                <div class="label">Need Attention</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="section">
            <h2>📈 Attendance Distribution</h2>
            <div class="charts-grid">
                {% if charts.attendance_pie %}
                <div class="chart-container">
                    <img src="data:image/png;base64,{{ charts.attendance_pie }}" alt="Attendance Distribution">
                </div>
                {% endif %}
                {% if charts.risk_bar %}
                <div class="chart-container">
                    <img src="data:image/png;base64,{{ charts.risk_bar }}" alt="Risk Distribution">
                </div>
                {% endif %}
                {% if charts.performance_column %}
                <div class="chart-container">
                    <img src="data:image/png;base64,{{ charts.performance_column }}" alt="Performance Distribution">
                </div>
                {% endif %}
                {% if charts.anomaly_bar %}
                <div class="chart-container">
                    <img src="data:image/png;base64,{{ charts.anomaly_bar }}" alt="Pattern Analysis">
                </div>
                {% endif %}
            </div>
        </div>

        <!-- AI Insights Section -->
        <div class="section">
            <h2>🤖 AI-Generated Insights</h2>
            <div class="insights-grid">
                {% for insight in insights %}
                <div class="insight-card {{ insight.type }}">
                    <h4>{{ insight.category }}</h4>
                    <p>{{ insight.insight }}</p>
                    <small><strong>Supporting Data:</strong> {{ insight.supporting_data }}</small>
                </div>
                {% endfor %}
            </div>
        </div>

        <!-- Recommendations Section -->
        <div class="section">
            <h2>🎯 Actionable Recommendations</h2>
            <div class="recommendations-list">
                {% for recommendation in recommendations %}
                <div class="recommendation-item {{ recommendation.priority }}">
                    <span class="priority">{{ recommendation.priority.upper() }} PRIORITY</span>
                    <h4>{{ recommendation.category }}: {{ recommendation.recommendation }}</h4>
                    <ul class="action-items">
                        {% for action in recommendation.action_items %}
                        <li>{{ action }}</li>
                        {% endfor %}
                    </ul>
                </div>
                {% endfor %}
            </div>
        </div>

        <!-- Top Performers Section -->
        {% if student_groups.top_performers %}
        <div class="section">
            <h2>🏆 Top Performers (≥90% Attendance)</h2>
            <table class="student-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Attendance %</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {% for student in student_groups.top_performers %}
                    <tr>
                        <td>{{ student.student_id }}</td>
                        <td>{{ student.student_name }}</td>
                        <td>{{ "%.1f"|format(student.attendance_percentage) }}%</td>
                        <td><span class="badge excellent">Excellent</span></td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% endif %}

        <!-- At-Risk Students Section -->
        {% if student_groups.at_risk_students %}
        <div class="section">
            <h2>⚠️ Students Needing Attention (<75% Attendance)</h2>
            <table class="student-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Attendance %</th>
                        <th>Risk Level</th>
                    </tr>
                </thead>
                <tbody>
                    {% for student in student_groups.at_risk_students %}
                    <tr>
                        <td>{{ student.student_id }}</td>
                        <td>{{ student.student_name }}</td>
                        <td>{{ "%.1f"|format(student.attendance_percentage) }}%</td>
                        <td><span class="badge {{ student.risk_level.lower().replace(' ', '-') }}">{{ student.risk_level }}</span></td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% endif %}

        <!-- Footer -->
        <div class="footer">
            <p>🤖 Powered by AI Attendance Analytics System | Version 1.0.0</p>
            <p>Generated on {{ generation_date }} | © 2024 Educational Analytics Platform</p>
        </div>
    </div>
</body>
</html>
        """
        
        return template_content
    
    def generate_html_report(self, 
                           analytics: Dict, 
                           insights: List[Dict], 
                           recommendations: List[Dict], 
                           student_groups: Dict,
                           institute_info: Dict,
                           output_path: str) -> bool:
        """
        Generate complete HTML report.
        
        Args:
            analytics (Dict): Analytics data
            insights (List[Dict]): Generated insights
            recommendations (List[Dict]): Generated recommendations
            student_groups (Dict): Student groups
            institute_info (Dict): Institute information
            output_path (str): Output file path
            
        Returns:
            bool: True if generation successful, False otherwise
        """
        try:
            logger.info("Generating HTML report")
            
            # Generate charts
            charts = self.generate_attendance_charts(analytics)
            
            # Create template
            template_content = self.create_html_template()
            template = self.template_env.from_string(template_content)
            
            # Prepare template data
            template_data = {
                'institute_name': institute_info.get('institute_name', 'Educational Institute'),
                'department': institute_info.get('department', 'Computer Science'),
                'academic_year': institute_info.get('academic_year', '2024-2025'),
                'division': institute_info.get('division', 'A'),
                'generation_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'analytics': analytics,
                'insights': insights,
                'recommendations': recommendations,
                'student_groups': student_groups,
                'charts': charts
            }
            
            # Render HTML
            html_content = template.render(**template_data)
            
            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"HTML report generated successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error generating HTML report: {str(e)}")
            return False
    
    def generate_complete_report(self, 
                              complete_analytics: Dict,
                              institute_info: Dict,
                              output_dir: str = "outputs") -> bool:
        """
        Generate complete HTML report from analytics package.
        
        Args:
            complete_analytics (Dict): Complete analytics package
            institute_info (Dict): Institute information
            output_dir (str): Output directory
            
        Returns:
            bool: True if generation successful, False otherwise
        """
        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate HTML report
            output_path = os.path.join(output_dir, "attendance_report.html")
            
            success = self.generate_html_report(
                analytics=complete_analytics['analytics'],
                insights=complete_analytics['insights'],
                recommendations=complete_analytics['recommendations'],
                student_groups=complete_analytics['student_groups'],
                institute_info=institute_info,
                output_path=output_path
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Error generating complete report: {str(e)}")
            return False


# Example usage and testing
if __name__ == "__main__":
    # Example usage
    generator = AttendanceReportGenerator()
    
    # This would be used with actual analytics data
    # complete_analytics = {...}
    # institute_info = {...}
    # generator.generate_complete_report(complete_analytics, institute_info)
    
    print("Report generator module loaded successfully!")
