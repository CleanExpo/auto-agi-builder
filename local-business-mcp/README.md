# Local Business Master Control Program (MCP)

A comprehensive system for finding, analyzing, and assisting struggling local businesses with their online presence.

## Features

- **Business Discovery**: Find businesses within a specific geographic radius
- **Performance Analysis**: Evaluate businesses based on their online presence, engagement, content quality, and reputation
- **Multi-platform Assessment**: Analyze data from Google Business Profile, Facebook, and other platforms
- **Flexible Export**: Export business data in CSV, JSON, Excel, and HTML formats
- **Visual Interface**: Interactive map and dashboard for exploring business data
- **Recommendation Engine**: Generate improvement suggestions tailored to each business

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL with PostGIS extension (see [Database Setup Guide](docs/database_setup.md))
- API keys for Google Maps Platform (see [Google Maps API Setup Guide](docs/google_maps_api_setup.md)), Google Business Profile, Facebook, etc.

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/local-business-mcp.git
cd local-business-mcp
```

2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a .env file with your API keys and configuration (see .env.example)

5. Initialize the database
```bash
python run.py init
```

### Usage

#### Running the API Server

```bash
python run.py api
```

This starts the API server at http://127.0.0.1:8000

#### Using the Command Line Interface

Search for businesses in a specific area:
```bash
python run.py cli search --location "40.7128,-74.0060" --radius 20 --business-type restaurant
```

Analyze business performance:
```bash
python run.py cli analyze --city "New York" --max-score 50
```

Export business data:
```bash
python run.py cli export --city "Seattle" --state "WA" --output businesses.xlsx
```

## API Endpoints

- `POST /search` - Search for businesses in a geographic area
- `GET /businesses` - Get businesses with their performance scores
- `POST /analyze/{business_id}` - Analyze a specific business
- `POST /analyze` - Analyze multiple businesses in an area
- `POST /export` - Export business data in various formats

## Development

### Project Structure

```
local_business_mcp/
├── src/
│   ├── config/         # Configuration settings
│   ├── data_collection/ # Data collection from APIs
│   ├── analysis/       # Business performance analysis
│   ├── export/         # Data export functionality
│   ├── ui/             # Web interface and API
│   └── utils/          # Utility functions
├── tests/              # Test modules
├── .env                # Environment variables (not in git)
├── requirements.txt    # Project dependencies
└── run.py              # Main entry point
```

### Key Components

1. **Google Places Integration**: Discovers local businesses using the Google Places API
2. **Performance Analyzer**: Scores businesses on multiple dimensions of online presence
3. **Data Exporters**: Flexible export options for business data and analysis results
4. **FastAPI Server**: RESTful API with automatic documentation 
5. **CLI Interface**: Command-line tools for discovery, analysis, and export operations

### Running Tests

```bash
pytest
```

## Performance Scoring System

Businesses are scored across four key dimensions:

1. **Online Presence** (30%): Website quality, SEO, and social media profiles
2. **Social Engagement** (30%): Follower counts, posting frequency, and engagement rates
3. **Reputation** (30%): Reviews, ratings, and sentiment analysis
4. **Content Quality** (10%): Quality and relevance of online content

The overall score is a weighted average of these dimensions, with lower scores indicating businesses that could benefit from assistance.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
