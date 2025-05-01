# Auto AGI Builder

<p align="center">
  <img src="frontend/public/images/logo.png" alt="Auto AGI Builder Logo" width="200" />
</p>

<p align="center">
  <strong>An end-to-end platform for building, deploying, and managing AI-powered applications</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Overview

Auto AGI Builder is a comprehensive platform that simplifies the process of creating, prototyping, and deploying AGI (Artificial General Intelligence) applications. It provides a structured workflow from requirements gathering to deployment, with built-in collaboration features, prototype generation, and automated testing.

The platform combines a powerful backend API built with FastAPI and a modern frontend interface built with Next.js, enabling teams to rapidly develop and iterate on AI-powered applications.

## Features

### Project Management

- **Project Dashboard**: Centralized overview of all your AGI projects
- **Requirements Management**: Define, prioritize, and track project requirements
- **Roadmap Planning**: Visual roadmap with timeline and kanban views
- **Client Management**: Manage client information and project associations

### Development Tools

- **Prototype Generation**: Automatically generate interactive prototypes based on requirements
- **Document Management**: Upload, organize, and share project documents
- **ROI Calculator**: Evaluate business metrics and potential return on investment
- **Visualization Tools**: Data visualization components for project insights

### Collaboration Features

- **Comment System**: Contextual comments on requirements, prototypes, and documents
- **Real-time Collaboration**: Multi-user editing with presence indicators
- **Notifications**: System-wide notifications for project updates
- **Export & Sharing**: Schedule and automate exports in various formats

### Security & Administration

- **Authentication**: Secure user authentication and authorization
- **Profile Management**: User profiles with customizable settings
- **Localization**: Multi-language support for global teams
- **Theme Support**: Light and dark mode interface

## System Requirements

- **Node.js**: v16.x or later
- **Python**: 3.9 or later
- **MongoDB**: 4.4 or later
- **NPM**: 7.x or later

## Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/auto-agi-builder.git
cd auto-agi-builder

# Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install backend dependencies
cd app
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.template .env.local
# Edit .env.local with your configuration
```

## Quick Start

### Running in Development Mode

1. Start the backend server:

```bash
cd app
uvicorn main:app --reload
```

2. In a separate terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# Access the application at http://localhost:3000
```

## Deployment

Auto AGI Builder supports multiple deployment options:

### Vercel Deployment (Recommended for Frontend)

```bash
# Deploy the frontend to Vercel
cd frontend
vercel --prod
```

Or use our automated deployment script:

```bash
# Run the deployment script
./run-deploy-fixes.bat
```

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Self-hosted Deployment

Follow our comprehensive guides:
- [Docker Deployment](docker-deployment.md)
- [MongoDB Setup](MONGODB-SETUP.md)
- [Custom Domain Configuration](deployment/CUSTOM-DOMAIN-SETUP.md)

## Documentation

### User Guides

- [Getting Started Guide](docs/getting-started.md)
- [Project Management](docs/project-management.md)
- [Requirements Tracking](docs/requirements-tracking.md)
- [Prototype Generation](docs/prototype-generation.md)
- [Collaboration Features](docs/collaboration.md)
- [Export Scheduling](docs/export_scheduling.md)

### Developer Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Troubleshooting](DEPLOYMENT-TROUBLESHOOTING.md)

## Troubleshooting

For common issues and solutions:

- [UI Provider Issues](UI-PROVIDER-CONTEXT-SOLUTION.md)
- [Domain Configuration](DOMAIN-TROUBLESHOOTING-GUIDE.md)
- [MongoDB Connection](MONGODB-SETUP-GUIDE.md)

## Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)

---

<p align="center">
  Made with ❤️ by the Auto AGI Builder Team
</p>
