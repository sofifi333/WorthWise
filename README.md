# WorthWise

![WorthWise Landing Page](landing_page.png)

WorthWise is a college return on investment (ROI) planning application that helps students make informed decisions about higher education. The platform enables users to compare colleges and programs, calculate true costs (tuition, housing, and living expenses), and project financial outcomes based on post-graduation earnings data. Users can analyze ROI, debt-to-income ratios, payback periods, and compare up to four scenarios simultaneously. The application integrates data from trusted government sources, including the U.S. Department of Education, HUD, Bureau of Economic Analysis, and Energy Information Administration.



---

## Project Setup Guide

### 1. Clone the Repository

```sh
git clone <repository-url>
cd worthwise
```

---

### 2. Configure Environment Variables

#### Backend

1. Navigate to the `backend` directory.
2. Create a `.env` file and add the following (edit MySQL credentials as needed):

    ```
    # Environment
    ENVIRONMENT=dev

    # Database - MySQL
    DATABASE_URL=mysql+pymysql://yourusername:yourpassword@localhost:3306/worthwise
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=yourusername
    MYSQL_PASSWORD=yourpassword
    MYSQL_DATABASE=worthwise

    # Application
    APP_NAME="WorthWise College ROI Planner"
    APP_VERSION=1.0.0
    API_V1_PREFIX=/api/v1
    DEBUG=True

    # Analytics Artifacts Path
    ARTIFACTS_PATH=./artifacts
    DUCKDB_PATH=./artifacts/analytics.duckdb

    # Server
    HOST=0.0.0.0
    PORT=8000
    ```
3. Navigate to the `etl` directory
4. Create a `.env` file and add the following (edit MySQL credentials as needed):
   ```
   # MySQL Configuration
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=yourusername
    MYSQL_PASSWORD=yourpassword
    MYSQL_DATABASE=worthwise
   ```
#### Frontend

1. Navigate to the `frontend` directory.
2. Create a `.env` file and add:

    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```

---

### 3. Install Dependencies

#### Backend

```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### ETL (Optional: Use a separate venv or backend's)

```sh
cd ../etl
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend

```sh
cd ../frontend
npm install
```

---

### 4. Set Up the Database

1. In MySQL Workbench, open and run `database/schema.sql` to create the required database schema.

---

### 5. Prepare Data Files

1. Download the College Scorecard zip file and extract it.
2. Copy the following files into the `data/` directory:
   - `Most-Recent-Cohorts-Instituition.csv`
   - `Most-Recent-Cohorts-Field-of-Study.csv`

---

### 6. Running the Project

#### ETL Pipeline

```sh
cd etl
python main.py
```

#### Backend API Server

```sh
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

#### Frontend Development Server

```sh
cd frontend
npm run dev
```


---

