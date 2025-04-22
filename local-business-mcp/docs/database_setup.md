# PostgreSQL with PostGIS Setup Guide

This guide will walk you through setting up PostgreSQL with the PostGIS extension for the Local Business MCP application.

## Windows Installation

### 1. Install PostgreSQL

1. Download the PostgreSQL installer from [the official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the wizard:
   - Select the components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Choose an installation directory
   - Set a password for the `postgres` user (remember this!)
   - Keep the default port (5432)
   - Select the default locale

### 2. Install PostGIS Extension

1. After PostgreSQL installation is complete, open the Stack Builder application that was installed
2. Select your PostgreSQL installation from the dropdown
3. Expand the "Spatial Extensions" category and check "PostGIS"
4. Click Next and follow the installation wizard to install PostGIS

### 3. Create Database and Enable PostGIS

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to your PostgreSQL server by double-clicking on it and entering your password
3. Right-click on "Databases" and select "Create" > "Database"
4. Enter `local_business_mcp` as the database name and select `postgres` as the owner
5. Click "Save" to create the database
6. Connect to the new database by clicking on it
7. Right-click on the database and select "Query Tool"
8. Run the following SQL command to enable PostGIS:
   ```sql
   CREATE EXTENSION postgis;
   ```
9. Verify PostGIS is installed by running:
   ```sql
   SELECT PostGIS_version();
   ```

## macOS Installation

### 1. Install PostgreSQL and PostGIS using Homebrew

1. Install Homebrew if you don't have it:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install PostgreSQL and PostGIS:
   ```bash
   brew install postgresql
   brew install postgis
   ```

3. Start the PostgreSQL service:
   ```bash
   brew services start postgresql
   ```

### 2. Create Database and Enable PostGIS

1. Create the database:
   ```bash
   createdb local_business_mcp
   ```

2. Connect to the database and enable PostGIS:
   ```bash
   psql -d local_business_mcp -c "CREATE EXTENSION postgis;"
   ```

3. Verify PostGIS is installed:
   ```bash
   psql -d local_business_mcp -c "SELECT PostGIS_version();"
   ```

## Linux (Ubuntu/Debian) Installation

### 1. Install PostgreSQL and PostGIS

1. Update package lists:
   ```bash
   sudo apt update
   ```

2. Install PostgreSQL and PostGIS:
   ```bash
   sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3
   ```
   Note: Replace `postgresql-14-postgis-3` with the appropriate version for your system if needed.

3. Start and enable PostgreSQL service:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

### 2. Create Database and Enable PostGIS

1. Switch to the postgres user:
   ```bash
   sudo -i -u postgres
   ```

2. Create a database user (optional, you can use the postgres user):
   ```bash
   createuser --interactive
   # Enter your username when prompted
   # Answer 'y' to superuser question for simplicity
   ```

3. Create the database:
   ```bash
   createdb local_business_mcp
   ```

4. Connect to the database and enable PostGIS:
   ```bash
   psql -d local_business_mcp -c "CREATE EXTENSION postgis;"
   ```

5. Verify PostGIS is installed:
   ```bash
   psql -d local_business_mcp -c "SELECT PostGIS_version();"
   ```

6. Exit the postgres user:
   ```bash
   exit
   ```

## Setting Up the Environment File

After setting up the database, update your `.env` file with the correct database connection details:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=local_business_mcp
DB_USER=postgres  # or your custom username if you created one
DB_PASSWORD=your_password  # password you set during installation
```

## Testing the Connection

After setting up the database and configuring the `.env` file, you can test the connection by running:

```bash
python run.py init
```

This command should initialize the database tables without any errors if your connection is properly configured.

## Troubleshooting

### Connection Refused

If you get a "connection refused" error, check that:
- PostgreSQL service is running
- The port in your `.env` file matches the port PostgreSQL is running on (usually 5432)
- Your firewall is not blocking the connection

### Authentication Failed

If you get an "authentication failed" error, check that:
- The username and password in your `.env` file are correct
- The user has the necessary permissions to create and modify tables

### PostGIS Not Available

If you get an error about PostGIS functions not being available, check that:
- The PostGIS extension was successfully installed
- The extension was enabled for the specific database you're using
