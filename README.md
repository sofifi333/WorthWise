# WorthWise

[![WorthWise Presentation](/assets/Thumbnail.png)](https://drive.google.com/file/d/1LT0JDmViIWK8fXzK8VXp24YV1GmWY1ym/view?usp=sharing)

WorthWise is a college return on investment (ROI) planning application that helps students make informed decisions about higher education. The platform enables users to compare colleges and programs, calculate true costs (tuition, housing, and living expenses), and project financial outcomes based on post-graduation earnings data. Users can analyze ROI, debt-to-income ratios, payback periods, and compare up to four scenarios simultaneously. The application integrates data from trusted government sources, including the U.S. Department of Education, HUD, Bureau of Economic Analysis, and Energy Information Administration.


[Click here to explore WorthWise](https://worthwise-nu.vercel.app/)

[CTP Demo Night Slides](https://docs.google.com/presentation/d/1OiMg9UnYODVICZGAXs30TRAaH4_GvJyFWDUrjZuvT_A/edit?usp=sharing)



## WorthWise Showcase
![WorthWise Landing Page](/assets/Landing_page.png)
---
![WorthWise Planner Page 1](/assets/Planner_page_1.png)
![WorthWise Planner Page 2](/assets/Planner_page_2.png)
![WorthWise Planner Page 3](/assets/Planner_page_3.png)
---
![WorthWise Compare Page 1](/assets/Compare_page_1.png)
![WorthWise Compare Page 2](/assets/Compare_page_2.png)
![WorthWise Planner Page 3](/assets/Compare_page_3.png)
![WorthWise Planner Page 4](/assets/Compare_page_4.png)
---

## General Tech Stack
- `Frontend:` Next.js, TypeScript, Recharts, Tailwind CSS <br>
- `Backend:` Python, FastAPI <br>
- `ML / Data Science:` Pandas, Numpy, Qwen3 <br>
- `Database:` DuckDB, MySQL <br>

![WorthWise Tech Stack](/assets/WorthWise_Techstack.png)

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
    HF_SERVICE_URL=yourhuggingfacespace.hf
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
pip install -r ../requirements.txt
```

#### ETL

```sh
cd ../etl
source ../venv/bin/activate  # Uses the venv from project root
```

#### Frontend

```sh
cd ../frontend
npm install
```

---

### 4. Set Up the Database

1. **For Local Development**: In MySQL Workbench, open and run `database/schema.sql` to create the required database schema.

2. **For Production (Aiven)**: Use `database/schema_aiven.sql` which is compatible with managed MySQL services like Aiven. This version removes DEFINER clauses that require SUPER privileges not available in managed environments.

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

