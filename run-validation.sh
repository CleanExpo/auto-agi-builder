#!/bin/bash
#
# Auto AGI Builder - Comprehensive Validation Runner
# This script runs the Sequential Thinking MCP validation tool and generates a report
#

echo "🚀 Auto AGI Builder - Comprehensive Validation"
echo "=============================================="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js to run the validation tool."
    exit 1
fi

# Check if sequential-thinking-mcp.js exists
if [ ! -f "./sequential-thinking-mcp.js" ]; then
    echo "❌ Error: sequential-thinking-mcp.js not found. Make sure you run this script from the directory containing the validation tool."
    exit 1
fi

# Create reports directory if it doesn't exist
if [ ! -d "./validation-reports" ]; then
    echo "📁 Creating validation-reports directory..."
    mkdir -p ./validation-reports
fi

# Generate timestamp for the report file
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="./validation-reports/validation-report_${TIMESTAMP}.md"

echo "🔍 Running validation..."
echo ""

# Run the validation tool
node sequential-thinking-mcp.js --report > "${REPORT_FILE}"

# Check if the report was generated successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Validation completed successfully!"
    echo "📄 Report generated: ${REPORT_FILE}"
    
    # Count issues by severity
    CRITICAL=$(grep -c "importance: 'critical'" "${REPORT_FILE}" || echo "0")
    HIGH=$(grep -c "importance: 'high'" "${REPORT_FILE}" || echo "0")
    MEDIUM=$(grep -c "importance: 'medium'" "${REPORT_FILE}" || echo "0")
    LOW=$(grep -c "importance: 'low'" "${REPORT_FILE}" || echo "0")
    
    echo ""
    echo "📊 Issue Summary:"
    echo "  🔴 Critical: ${CRITICAL}"
    echo "  🟠 High: ${HIGH}"
    echo "  🟡 Medium: ${MEDIUM}"
    echo "  🟢 Low: ${LOW}"
    
    # Open the report if on a system with a supported viewer
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "${REPORT_FILE}"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        # Windows
        start "${REPORT_FILE}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "${REPORT_FILE}"
        fi
    fi
    
    echo ""
    echo "📚 Next Steps:"
    echo "1. Review the validation report"
    echo "2. Address critical issues first"
    echo "3. Update implementation based on recommendations"
    echo "4. Re-run validation to track progress"
    
    exit 0
else
    echo ""
    echo "❌ Validation failed. Please check the error message above."
    exit 1
fi
