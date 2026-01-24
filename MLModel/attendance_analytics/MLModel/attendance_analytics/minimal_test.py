"""
Minimal test to check API
"""

import urllib.request

def test_minimal():
    """Minimal test"""
    try:
        with urllib.request.urlopen("http://localhost:5000/") as response:
            print(f"Status: {response.status}")
            print(f"Headers: {response.headers}")
            data = response.read().decode('utf-8')
            print(f"Data length: {len(data)}")
            print(f"First 500 chars: {data[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_minimal()
