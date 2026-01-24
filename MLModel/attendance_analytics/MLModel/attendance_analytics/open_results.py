"""
Open results files properly
"""

import os
import subprocess
import sys

def open_file(file_path):
    """Open file with default application"""
    try:
        if os.name == 'nt':  # Windows
            os.startfile(file_path)
        elif os.name == 'posix':  # macOS and Linux
            subprocess.run(['open', file_path], check=True)
        print(f"✅ Opened: {file_path}")
    except Exception as e:
        print(f"❌ Error opening {file_path}: {e}")

def main():
    print("🎯 Opening Results Files...")
    
    # Open HTML report
    html_file = "outputs/attendance_report.html"
    if os.path.exists(html_file):
        open_file(html_file)
    else:
        print(f"❌ File not found: {html_file}")
    
    # Try to open Excel file
    excel_file = "outputs/attendance_predictions.xlsx"
    if os.path.exists(excel_file):
        print(f"📊 Excel file available: {excel_file}")
        print("💡 Open manually with Excel or compatible software")
    else:
        print(f"❌ File not found: {excel_file}")

if __name__ == "__main__":
    main()
