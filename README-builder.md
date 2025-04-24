# Auto AGI Builder

An AI-powered prototype development platform that automates the process of requirements analysis, architecture design, and code generation.

## Overview

Auto AGI Builder is a comprehensive toolkit designed to streamline the development of AI-powered applications. It combines frontend, backend, and AI components to create a seamless developer experience. The system analyzes requirements, suggests architectures, generates code, and can even improve existing codebases.

### Key Features

- **Requirements Analysis**: Extract structured requirements from documents
- **Architecture Design**: Generate system architecture based on requirements
- **Code Generation**: Create code for components based on specifications
- **Code Improvement**: Enhance existing code for various aspects (performance, security, etc.)
- **Testing**: Generate test cases for your code
- **Deployment**: Deploy your application to various platforms

## System Components

The Auto AGI Builder is built with a modular architecture consisting of the following components:

1. **BuilderCore** (`builder_core.py`): The foundation of the system that provides common utilities like file operations, environment checks, and command execution.

2. **FrontendBuilder** (`frontend_builder.py`): Handles the generation of frontend components, including React components, pages, and utilities for Next.js applications.

3. **BackendBuilder** (`backend_builder.py`): Manages the creation of backend components, including FastAPI endpoints, database models, and service layers.

4. **AIBuilder** (`ai_builder.py`): Integrates with AI services to analyze documents, generate code, improve existing code, and suggest architectures.

5. **AutonomousBuilder** (`autonomous_builder_modular.py`): The main entry point that combines all builder components and provides a unified CLI interface.

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/auto-agi-builder.git
   cd auto-agi-builder
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

## Usage

The Auto AGI Builder can be used via command line with the following commands:

### 1. Project Setup

Create a new project with all necessary files and structure:

```bash
python autonomous_builder_modular.py setup --name my_project
```

Options:
- `--project-root PATH`: Specify a custom project root directory
- `--api-key KEY`: Provide an OpenAI API key (otherwise uses the one from .env file)

### 2. Generate Prototype

Generate a prototype based on requirements document:

```bash
python autonomous_builder_modular.py generate --requirements requirements.txt --output prototype_dir
```

Options:
- `--requirements PATH`: Path to requirements file (required)
- `--output DIR`: Output directory for the prototype (default: "prototype")

### 3. Analyze Documents

Analyze a document to extract structured information:

```bash
python autonomous_builder_modular.py analyze --document document.txt --analysis-type requirements
```

Options:
- `--document PATH`: Path to document to analyze (required)
- `--analysis-type TYPE`: Type of analysis to perform (requirements, summary, code_review)

### 4. Improve Code

Automatically improve existing code:

```bash
python autonomous_builder_modular.py improve --code file.py --improvement-type performance
```

Options:
- `--code PATH`: Path to code file to improve (required)
- `--improvement-type TYPE`: Type of improvement (general, performance, security, documentation, refactoring)

### 5. Deploy Project

Deploy the project to a target platform:

```bash
python autonomous_builder_modular.py deploy --target vercel
```

Options:
- `--target PLATFORM`: Deployment target (vercel, netlify, aws, azure, gcp)

## Example Workflow

1. Create a project:
   ```bash
   python autonomous_builder_modular.py setup --name my_saas_app
   ```

2. Create a requirements.txt file:
   ```
   The system should have a user authentication module with login, register, and password reset functionality.
   Users should be able to create projects and add requirements to them.
   The system should analyze requirements and generate prototype code.
   The system should have a dashboard showing project progress and metrics.
   ```

3. Generate a prototype based on requirements:
   ```bash
   python autonomous_builder_modular.py generate --requirements requirements.txt --output prototype
   ```

4. Improve generated code:
   ```bash
   python autonomous_builder_modular.py improve --code prototype/auth_module.py --improvement-type security
   ```

5. Deploy the project:
   ```bash
   python autonomous_builder_modular.py deploy --target vercel
   ```

## Extending the System

The Auto AGI Builder is designed to be modular and extensible. You can add new functionality by:

1. Creating new methods in the existing builder classes
2. Adding new builder classes for specific functionality
3. Extending the CLI interface in the `main()` function of `autonomous_builder_modular.py`

### Adding a New Builder Component

1. Create a new Python file (e.g., `my_builder.py`)
2. Import the `BuilderCore` class
3. Create a new class that inherits from `BuilderCore`
4. Implement your custom methods
5. Import and use your new class in `autonomous_builder_modular.py`

## Architecture

The Auto AGI Builder follows a layered architecture:

1. **Core Layer** (`BuilderCore`): Provides foundational utilities and services
2. **Domain Layer** (`FrontendBuilder`, `BackendBuilder`, `AIBuilder`): Implements domain-specific functionality
3. **Application Layer** (`AutonomousBuilder`): Coordinates the domain components and exposes the CLI interface

This architecture allows for separation of concerns and makes it easy to extend the system with new functionality.

## Troubleshooting

### Common Issues

1. **OpenAI API Key Issues**:
   - Error: "OpenAI client not initialized"
   - Solution: Ensure your OpenAI API key is set in the `.env` file or passed via the `--api-key` parameter

2. **Node.js Version Issues**:
   - Error: "Node.js 16+ is recommended"
   - Solution: Update your Node.js version using nvm or the official installer

3. **File Not Found Errors**:
   - Error: "Failed to read file at [path]"
   - Solution: Ensure the file exists and the path is correct relative to the project root

### Logs

The Auto AGI Builder logs information to:
- Console (standard output)
- `auto_agi_builder.log` file in the project root

Check these logs for detailed information about errors and operation progress.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
