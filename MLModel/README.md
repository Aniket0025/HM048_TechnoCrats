# MLModel

This folder contains ML models and APIs for the HackMatrix education management system.

## Contents

1. **Tabular ML Pipeline** (original)
   - training: `src/train.py`
   - inference: `src/predict.py`
   - saved artifacts: `models/`

2. **Geo-Fencing System** (new)
   - Core validator: `geofence_validator.py`
   - Flask API: `geofence_api.py`
   - API runner: `run_geofence_api.py`

---

# Geo-Fencing System

The geo-fencing system provides location-based attendance validation using advanced ML algorithms for accuracy and anomaly detection.

## Features

- **Haversine Distance Calculation**: Accurate distance measurement between GPS coordinates
- **Multi-Fence Validation**: Check location against multiple geo-fence zones
- **ML-Based Radius Optimization**: Automatically determine optimal fence radius
- **Location Anomaly Detection**: Identify suspicious location patterns
- **Coverage Area Analysis**: Calculate and analyze fence coverage

## Setup

```bash
# Navigate to MLModel directory
cd MLModel

# Create virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

## Quick Start

### Option 1: Run with the helper script
```bash
python run_geofence_api.py
```

### Option 2: Run directly
```bash
python geofence_api.py
```

The API will be available at `http://localhost:5001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/geofence/validate` | Validate location against fences |
| POST | `/api/geofence/create` | Create new geo-fence zone |
| GET | `/api/geofence/list` | List all geo-fence zones |
| PUT | `/api/geofence/<id>` | Update geo-fence zone |
| DELETE | `/api/geofence/<id>` | Delete geo-fence zone |
| POST | `/api/geofence/optimize-radius` | Get optimized fence radius |
| POST | `/api/geofence/detect-anomalies` | Detect location anomalies |
| GET | `/api/geofence/coverage-area` | Get coverage statistics |

## Example Usage

### Validate Location
```bash
curl -X POST http://localhost:5001/api/geofence/validate \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 18.5204,
    "longitude": 73.8567,
    "user_id": "user123"
  }'
```

### Create Geo-Fence
```bash
curl -X POST http://localhost:5001/api/geofence/create \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session123",
    "location_name": "Classroom 101",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "radius_meters": 50,
    "college_name": "Test College"
  }'
```

## Integration with Backend

The Node.js backend integrates with the Python API through HTTP requests. The backend provides:

- Database persistence for geo-fence zones
- Authentication and authorization
- RESTful API endpoints for the frontend
- Caching and performance optimization

## Core Classes

### GeoFenceValidator
Main class for geo-fencing operations:
- `haversine_distance()`: Calculate distance between coordinates
- `is_point_in_fence()`: Check if point is within a fence
- `validate_multiple_fences()`: Validate against multiple fences
- `optimize_fence_radius()`: ML-based radius optimization
- `detect_location_anomalies()`: Anomaly detection

### Data Classes
- `GeoFenceZone`: Represents a geo-fence zone
- `LocationPoint`: Represents a GPS location point

---

# Original Tabular ML Pipeline

This folder contains a runnable, minimal ML pipeline (tabular CSV) with:

- training: `src/train.py`
- inference: `src/predict.py`
- saved artifacts: `models/`

## Setup

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### If installation fails on Windows (NumPy tries to build)

If you see errors like `Unknown compiler(s)` / `cl not found` / `vswhere.exe` missing, `pip` is trying to compile NumPy from source (no prebuilt wheel for your Python).

1) Check your Python version:

```bash
python --version
```

2) Recommended:

- Use **Python 3.11 or 3.12 (64-bit)** for easiest installs.

3) Recreate the venv after changing Python:

```bash
deactivate
Remove-Item -Recurse -Force .venv
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

## Data format

Provide a CSV file with a header row.

- One column is your **target** (label)
- All other columns are treated as features

## Train

```bash
python src/train.py --data data/dataset.csv --target target_column
```

Outputs:

- `models/model.joblib`
- `models/metadata.json`

## Predict

```bash
python src/predict.py --model models/model.joblib --data data/dataset.csv --out predictions.csv
```

The output file will include a `prediction` column.
