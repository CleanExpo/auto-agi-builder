#!/usr/bin/env python
"""
Local Business Master Control Program (MCP) main entry point.
Provides CLI commands for various operations.
"""
import sys
import os
import argparse
import logging
from typing import List, Optional, Dict, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("local_business_mcp")

# Import local modules
from src.config.settings import get_settings
from src.config.database import init_db
from src.ui.api import start_api_server
from src.data_collection.google_places import discover_businesses
from src.analysis.performance_analyzer import analyze_business_performance, analyze_businesses_in_area
from src.export.exporters import export_businesses


def init_command(args) -> int:
    """
    Initialize the database and create required tables.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    logger.info("Initializing database...")
    
    try:
        init_db()
        logger.info("Database initialization completed successfully.")
        return 0
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return 1


def api_command(args) -> int:
    """
    Start the API server.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    logger.info("Starting API server...")
    
    try:
        settings = get_settings()
        logger.info(f"API will be available at http://{settings['api_host']}:{settings['api_port']}")
        logger.info(f"API documentation available at http://{settings['api_host']}:{settings['api_port']}/docs")
        
        start_api_server()
        return 0
    except Exception as e:
        logger.error(f"API server failed: {e}")
        return 1


def cli_search_command(args) -> int:
    """
    Discover businesses through the CLI.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    try:
        logger.info(f"Searching for businesses near {args.location} within {args.radius}km radius...")
        
        # Parse business types if provided
        business_types = args.business_type.split(",") if args.business_type else None
        
        # Parse keywords if provided
        keywords = args.keywords.split(",") if args.keywords else None
        
        # Discover businesses
        business_ids = discover_businesses(
            location=args.location,
            radius_km=args.radius,
            keywords=keywords,
            business_types=business_types,
            max_results=args.max_results
        )
        
        if business_ids:
            logger.info(f"Found {len(business_ids)} businesses.")
            
            # Print the first few business IDs
            for business_id in business_ids[:10]:
                logger.info(f"Business ID: {business_id}")
            
            if len(business_ids) > 10:
                logger.info(f"... and {len(business_ids) - 10} more.")
            
            return 0
        else:
            logger.warning("No businesses found matching the criteria.")
            return 0
    
    except Exception as e:
        logger.error(f"Business discovery failed: {e}")
        return 1


def cli_analyze_command(args) -> int:
    """
    Analyze businesses through the CLI.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    try:
        if args.business_id:
            logger.info(f"Analyzing business with ID {args.business_id}...")
            result = analyze_business_performance(args.business_id)
            
            # Print results
            logger.info(f"Business: {result['business_name']}")
            logger.info(f"Overall Score: {result['scores']['overall']:.1f}")
            logger.info(f"Online Presence Score: {result['scores']['online_presence']:.1f}")
            logger.info(f"Social Engagement Score: {result['scores']['social_engagement']:.1f}")
            logger.info(f"Reputation Score: {result['scores']['reputation']:.1f}")
            logger.info(f"Content Quality Score: {result['scores']['content_quality']:.1f}")
            
            logger.info("Recommendations:")
            for recommendation in result.get('recommendations', []):
                logger.info(f"- {recommendation}")
                
        elif args.city and args.state:
            logger.info(f"Analyzing businesses in {args.city}, {args.state}...")
            
            results = analyze_businesses_in_area(
                city=args.city,
                state=args.state,
                max_score=args.max_score,
                max_businesses=args.max_results
            )
            
            if results:
                logger.info(f"Found {len(results)} businesses with score below {args.max_score if args.max_score else 'any'}.")
                
                # Sort by overall score (lowest first)
                results.sort(key=lambda x: x['scores']['overall'])
                
                # Print the first few businesses
                for result in results[:5]:
                    logger.info(f"{result['business_name']} - Overall Score: {result['scores']['overall']:.1f}")
                    
                if len(results) > 5:
                    logger.info(f"... and {len(results) - 5} more.")
                
                # Export results if requested
                if args.export:
                    export_path = args.export
                    
                    # Determine export format from file extension
                    _, ext = os.path.splitext(export_path)
                    if not ext or ext[1:] not in ('csv', 'json', 'xlsx', 'html'):
                        export_path += '.json'  # Default to JSON
                        export_format = 'json'
                    else:
                        export_format = ext[1:]
                        if export_format == 'xlsx':
                            export_format = 'excel'
                    
                    # Get all business IDs from results
                    business_ids = [r['business_id'] for r in results]
                    
                    # Export
                    output_path = export_businesses(
                        export_format=export_format,
                        output_path=export_path,
                        business_ids=business_ids
                    )
                    
                    logger.info(f"Exported results to {output_path}")
            else:
                logger.warning("No businesses found matching the criteria.")
        else:
            logger.error("Either business_id or city and state must be provided.")
            return 1
            
        return 0
    
    except Exception as e:
        logger.error(f"Business analysis failed: {e}")
        return 1


def cli_export_command(args) -> int:
    """
    Export businesses data through the CLI.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    try:
        logger.info(f"Exporting businesses data to {args.output}...")
        
        # Parse business IDs if provided
        business_ids = [int(bid) for bid in args.business_ids.split(",")] if args.business_ids else None
        
        # Determine export format from file extension
        _, ext = os.path.splitext(args.output)
        if not ext or ext[1:] not in ('csv', 'json', 'xlsx', 'html'):
            args.output += '.json'  # Default to JSON
            export_format = 'json'
        else:
            export_format = ext[1:]
            if export_format == 'xlsx':
                export_format = 'excel'
        
        # Export
        output_path = export_businesses(
            export_format=export_format,
            output_path=args.output,
            business_ids=business_ids,
            city=args.city,
            state=args.state,
            max_results=args.max_results
        )
        
        logger.info(f"Exported data to {output_path}")
        return 0
    
    except Exception as e:
        logger.error(f"Export failed: {e}")
        return 1


def cli_command(args) -> int:
    """
    Route CLI subcommands to appropriate handler.
    
    Args:
        args: Command-line arguments.
        
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    if args.cli_cmd == 'search':
        return cli_search_command(args)
    elif args.cli_cmd == 'analyze':
        return cli_analyze_command(args)
    elif args.cli_cmd == 'export':
        return cli_export_command(args)
    else:
        logger.error(f"Unknown CLI command: {args.cli_cmd}")
        return 1


def main() -> int:
    """
    Main entry point for the application.
    
    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    parser = argparse.ArgumentParser(
        description="Local Business Master Control Program (MCP)",
        epilog="For more information, see the documentation."
    )
    
    # Global arguments
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    # Subcommands
    subparsers = parser.add_subparsers(
        dest='command',
        help='Command to execute'
    )
    
    # init command
    init_parser = subparsers.add_parser(
        'init',
        help='Initialize the database'
    )
    
    # api command
    api_parser = subparsers.add_parser(
        'api',
        help='Start the API server'
    )
    
    # cli command
    cli_parser = subparsers.add_parser(
        'cli',
        help='Execute CLI commands'
    )
    
    cli_subparsers = cli_parser.add_subparsers(
        dest='cli_cmd',
        help='CLI command to execute'
    )
    
    # cli search command
    search_parser = cli_subparsers.add_parser(
        'search',
        help='Search for businesses in a geographic area'
    )
    search_parser.add_argument(
        '--location', '-l',
        required=True,
        help='Location to search (address or "latitude,longitude")'
    )
    search_parser.add_argument(
        '--radius', '-r',
        type=float,
        default=20.0,
        help='Search radius in kilometers (default: 20)'
    )
    search_parser.add_argument(
        '--business-type', '-b',
        help='Comma-separated list of business types to filter by'
    )
    search_parser.add_argument(
        '--keywords', '-k',
        help='Comma-separated list of keywords to search for'
    )
    search_parser.add_argument(
        '--max-results', '-m',
        type=int,
        default=100,
        help='Maximum number of results to return (default: 100)'
    )
    
    # cli analyze command
    analyze_parser = cli_subparsers.add_parser(
        'analyze',
        help='Analyze business performance'
    )
    analyze_parser.add_argument(
        '--business-id', '-b',
        type=int,
        help='Business ID to analyze'
    )
    analyze_parser.add_argument(
        '--city', '-c',
        help='City to analyze businesses in'
    )
    analyze_parser.add_argument(
        '--state', '-s',
        help='State to analyze businesses in'
    )
    analyze_parser.add_argument(
        '--max-score', '-m',
        type=float,
        help='Only include businesses with scores below this threshold'
    )
    analyze_parser.add_argument(
        '--max-results', '-n',
        type=int,
        default=100,
        help='Maximum number of businesses to analyze (default: 100)'
    )
    analyze_parser.add_argument(
        '--export', '-e',
        help='Export analysis results to the specified file'
    )
    
    # cli export command
    export_parser = cli_subparsers.add_parser(
        'export',
        help='Export business data'
    )
    export_parser.add_argument(
        '--output', '-o',
        required=True,
        help='Output file path (format determined by extension: .csv, .json, .xlsx, .html)'
    )
    export_parser.add_argument(
        '--business-ids', '-b',
        help='Comma-separated list of business IDs to export'
    )
    export_parser.add_argument(
        '--city', '-c',
        help='City to filter businesses by'
    )
    export_parser.add_argument(
        '--state', '-s',
        help='State to filter businesses by'
    )
    export_parser.add_argument(
        '--max-results', '-n',
        type=int,
        default=100,
        help='Maximum number of businesses to export (default: 100)'
    )
    
    # Parse arguments
    args = parser.parse_args()
    
    # Configure logging
    if args.verbose:
        logger.setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    
    # Execute command
    if args.command == 'init':
        return init_command(args)
    elif args.command == 'api':
        return api_command(args)
    elif args.command == 'cli':
        return cli_command(args)
    else:
        parser.print_help()
        return 1

if __name__ == "__main__":
    sys.exit(main())
