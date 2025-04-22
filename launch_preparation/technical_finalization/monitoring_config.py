"""
Monitoring Configuration for Auto AGI Builder
--------------------------------------------
Comprehensive monitoring setup to track platform health, performance, and usage

This script provides:
1. Centralized logging configuration
2. Prometheus metric instrumentation
3. Grafana dashboard provisioning
4. Alert rule definitions based on SLI/SLO thresholds
5. Health check endpoint configuration
"""

import os
import sys
import json
import yaml
import argparse
import logging
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("monitoring_setup.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("monitoring_setup")


class MonitoringConfig:
    """Core configuration for monitoring setup"""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize monitoring configuration
        
        Args:
            config_path: Path to monitoring configuration file
        """
        # Default paths
        self.base_path = Path("monitoring")
        self.prometheus_path = self.base_path / "prometheus"
        self.grafana_path = self.base_path / "grafana"
        self.dashboards_path = self.grafana_path / "dashboards"
        self.datasources_path = self.grafana_path / "datasources"
        self.alertmanager_path = self.base_path / "alertmanager"
        self.loki_path = self.base_path / "loki"
        
        # Load configuration from file if provided
        self.config = {
            "environment": "production",
            "retention_days": 30,
            "metric_scrape_interval": "15s",
            "log_scrape_interval": "1m",
            "alert_evaluation_interval": "1m",
            "alert_receivers": [
                {
                    "name": "operations-team",
                    "email_configs": [
                        {
                            "to": "ops@example.com",
                            "send_resolved": True
                        }
                    ],
                    "slack_configs": [
                        {
                            "channel": "#monitoring-alerts",
                            "send_resolved": True
                        }
                    ]
                }
            ],
            "service_level_objectives": {
                "availability": 99.9,  # 99.9% uptime
                "api_response_time_p95": 500,  # 95th percentile response time in ms
                "error_rate_threshold": 0.1  # 0.1% error rate
            },
            "endpoints": [
                {
                    "name": "api",
                    "url": "http://localhost:8000/api/v1/health",
                    "method": "GET",
                    "expected_status": 200,
                    "timeout": 5
                },
                {
                    "name": "frontend",
                    "url": "http://localhost:3000",
                    "method": "GET",
                    "expected_status": 200,
                    "timeout": 5
                }
            ],
            "components": [
                {
                    "name": "api-server",
                    "port": 8000,
                    "metrics_path": "/metrics",
                    "health_path": "/health"
                },
                {
                    "name": "frontend",
                    "port": 3000
                },
                {
                    "name": "database",
                    "port": 5432
                },
                {
                    "name": "redis",
                    "port": 6379
                }
            ]
        }
        
        # Load configuration from file if provided
        if config_path:
            self._load_config(config_path)
    
    def _load_config(self, config_path: str):
        """
        Load configuration from file
        
        Args:
            config_path: Path to configuration file
        """
        try:
            with open(config_path, "r") as f:
                # Determine file type from extension
                if config_path.endswith(".json"):
                    loaded_config = json.load(f)
                elif config_path.endswith((".yaml", ".yml")):
                    loaded_config = yaml.safe_load(f)
                else:
                    logger.error(f"Unsupported configuration file format: {config_path}")
                    return
                
                # Update default config with loaded values
                self.config.update(loaded_config)
                logger.info(f"Loaded configuration from {config_path}")
        
        except Exception as e:
            logger.error(f"Failed to load configuration from {config_path}: {e}")
    
    def setup_directory_structure(self):
        """Create directory structure for monitoring configuration"""
        logger.info("Creating directory structure for monitoring configuration")
        
        # Create base directories
        self.base_path.mkdir(exist_ok=True)
        self.prometheus_path.mkdir(exist_ok=True)
        self.grafana_path.mkdir(exist_ok=True)
        self.dashboards_path.mkdir(exist_ok=True)
        self.datasources_path.mkdir(exist_ok=True)
        self.alertmanager_path.mkdir(exist_ok=True)
        self.loki_path.mkdir(exist_ok=True)
        
        logger.info("Directory structure created")
        
        return True


class PrometheusConfig:
    """Configuration generator for Prometheus monitoring"""
    
    def __init__(self, config: MonitoringConfig):
        """
        Initialize Prometheus configuration
        
        Args:
            config: Monitoring configuration
        """
        self.config = config
    
    def generate_config(self) -> bool:
        """
        Generate Prometheus configuration
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Prometheus configuration")
        
        try:
            prometheus_config = {
                "global": {
                    "scrape_interval": self.config.config["metric_scrape_interval"],
                    "evaluation_interval": self.config.config["alert_evaluation_interval"],
                    "scrape_timeout": "10s"
                },
                "alerting": {
                    "alertmanagers": [
                        {
                            "static_configs": [
                                {
                                    "targets": ["localhost:9093"]
                                }
                            ]
                        }
                    ]
                },
                "rule_files": [
                    "rules/*.yml"
                ],
                "scrape_configs": [
                    {
                        "job_name": "prometheus",
                        "static_configs": [
                            {
                                "targets": ["localhost:9090"]
                            }
                        ]
                    }
                ]
            }
            
            # Add scrape configs for components
            for component in self.config.config["components"]:
                job_config = {
                    "job_name": component["name"],
                    "static_configs": [
                        {
                            "targets": [f"localhost:{component['port']}"]
                        }
                    ]
                }
                
                # Add metrics path if defined
                if "metrics_path" in component:
                    job_config["metrics_path"] = component["metrics_path"]
                
                prometheus_config["scrape_configs"].append(job_config)
            
            # Write configuration to file
            config_file = self.config.prometheus_path / "prometheus.yml"
            with open(config_file, "w") as f:
                yaml.dump(prometheus_config, f, default_flow_style=False)
            
            logger.info(f"Prometheus configuration generated: {config_file}")
            
            # Create rules directory
            rules_dir = self.config.prometheus_path / "rules"
            rules_dir.mkdir(exist_ok=True)
            
            # Generate alert rules
            self._generate_alert_rules(rules_dir)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Prometheus configuration: {e}")
            return False
    
    def _generate_alert_rules(self, rules_dir: Path) -> bool:
        """
        Generate Prometheus alert rules
        
        Args:
            rules_dir: Directory for alert rules
            
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Prometheus alert rules")
        
        try:
            # Availability alerts
            availability_rules = {
                "groups": [
                    {
                        "name": "availability",
                        "rules": [
                            {
                                "alert": "EndpointDown",
                                "expr": "probe_success == 0",
                                "for": "5m",
                                "labels": {
                                    "severity": "critical"
                                },
                                "annotations": {
                                    "summary": "Endpoint {{ $labels.instance }} is down",
                                    "description": "Endpoint {{ $labels.instance }} has been down for more than 5 minutes."
                                }
                            },
                            {
                                "alert": "HighErrorRate",
                                "expr": f"rate(http_requests_total{{status=~\"5..\",service=~\"api\"}}[5m]) / rate(http_requests_total{{service=~\"api\"}}[5m]) > {self.config.config['service_level_objectives']['error_rate_threshold'] / 100}",
                                "for": "5m",
                                "labels": {
                                    "severity": "critical"
                                },
                                "annotations": {
                                    "summary": "High error rate on {{ $labels.instance }}",
                                    "description": "Error rate on {{ $labels.instance }} is above threshold for more than 5 minutes."
                                }
                            }
                        ]
                    }
                ]
            }
            
            # Performance alerts
            performance_rules = {
                "groups": [
                    {
                        "name": "performance",
                        "rules": [
                            {
                                "alert": "HighResponseTime",
                                "expr": f"http_request_duration_milliseconds{{quantile=\"0.95\"}} > {self.config.config['service_level_objectives']['api_response_time_p95']}",
                                "for": "5m",
                                "labels": {
                                    "severity": "warning"
                                },
                                "annotations": {
                                    "summary": "High response time on {{ $labels.instance }}",
                                    "description": "95th percentile response time on {{ $labels.instance }} is above threshold for more than 5 minutes."
                                }
                            },
                            {
                                "alert": "HighCPUUsage",
                                "expr": "process_cpu_seconds_total{job=~\".+\"} / on(instance) group_left sum by(instance) (process_cpu_seconds_total{job=~\".+\"}) > 0.8",
                                "for": "15m",
                                "labels": {
                                    "severity": "warning"
                                },
                                "annotations": {
                                    "summary": "High CPU usage on {{ $labels.instance }}",
                                    "description": "CPU usage on {{ $labels.instance }} is above 80% for more than 15 minutes."
                                }
                            },
                            {
                                "alert": "HighMemoryUsage",
                                "expr": "process_resident_memory_bytes / process_virtual_memory_bytes > 0.8",
                                "for": "15m",
                                "labels": {
                                    "severity": "warning"
                                },
                                "annotations": {
                                    "summary": "High memory usage on {{ $labels.instance }}",
                                    "description": "Memory usage on {{ $labels.instance }} is above 80% for more than 15 minutes."
                                }
                            }
                        ]
                    }
                ]
            }
            
            # Resource alerts
            resource_rules = {
                "groups": [
                    {
                        "name": "resources",
                        "rules": [
                            {
                                "alert": "DiskSpaceLow",
                                "expr": "node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"} < 0.1",
                                "for": "5m",
                                "labels": {
                                    "severity": "warning"
                                },
                                "annotations": {
                                    "summary": "Low disk space on {{ $labels.instance }}",
                                    "description": "Disk space on {{ $labels.instance }} is below 10% for more than 5 minutes."
                                }
                            },
                            {
                                "alert": "HighDatabaseConnections",
                                "expr": "pg_stat_activity_count / pg_settings_max_connections > 0.8",
                                "for": "5m",
                                "labels": {
                                    "severity": "warning"
                                },
                                "annotations": {
                                    "summary": "High database connections on {{ $labels.instance }}",
                                    "description": "Database connections on {{ $labels.instance }} are above 80% of maximum for more than 5 minutes."
                                }
                            }
                        ]
                    }
                ]
            }
            
            # Write rules to files
            with open(rules_dir / "availability.yml", "w") as f:
                yaml.dump(availability_rules, f, default_flow_style=False)
            
            with open(rules_dir / "performance.yml", "w") as f:
                yaml.dump(performance_rules, f, default_flow_style=False)
            
            with open(rules_dir / "resources.yml", "w") as f:
                yaml.dump(resource_rules, f, default_flow_style=False)
            
            logger.info("Prometheus alert rules generated")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Prometheus alert rules: {e}")
            return False


class AlertManagerConfig:
    """Configuration generator for AlertManager"""
    
    def __init__(self, config: MonitoringConfig):
        """
        Initialize AlertManager configuration
        
        Args:
            config: Monitoring configuration
        """
        self.config = config
    
    def generate_config(self) -> bool:
        """
        Generate AlertManager configuration
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating AlertManager configuration")
        
        try:
            alertmanager_config = {
                "global": {
                    "resolve_timeout": "5m",
                    "smtp_smarthost": "smtp.example.com:587",
                    "smtp_from": "alerts@example.com",
                    "smtp_auth_username": "alerts@example.com",
                    "smtp_auth_password": "${SMTP_PASSWORD}",  # Use environment variable
                    "smtp_require_tls": True
                },
                "route": {
                    "group_by": ["alertname", "job"],
                    "group_wait": "30s",
                    "group_interval": "5m",
                    "repeat_interval": "12h",
                    "receiver": "operations-team",
                    "routes": [
                        {
                            "match": {
                                "severity": "critical"
                            },
                            "receiver": "operations-team",
                            "repeat_interval": "1h"
                        }
                    ]
                },
                "receivers": self.config.config["alert_receivers"],
                "inhibit_rules": [
                    {
                        "source_match": {
                            "severity": "critical"
                        },
                        "target_match": {
                            "severity": "warning"
                        },
                        "equal": ["alertname", "instance"]
                    }
                ]
            }
            
            # Write configuration to file
            config_file = self.config.alertmanager_path / "alertmanager.yml"
            with open(config_file, "w") as f:
                yaml.dump(alertmanager_config, f, default_flow_style=False)
            
            logger.info(f"AlertManager configuration generated: {config_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate AlertManager configuration: {e}")
            return False


class GrafanaConfig:
    """Configuration generator for Grafana dashboards"""
    
    def __init__(self, config: MonitoringConfig):
        """
        Initialize Grafana configuration
        
        Args:
            config: Monitoring configuration
        """
        self.config = config
    
    def generate_config(self) -> bool:
        """
        Generate Grafana configuration
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Grafana configuration")
        
        try:
            # Generate datasources
            self._generate_datasources()
            
            # Generate dashboards
            self._generate_dashboards()
            
            logger.info("Grafana configuration generated")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Grafana configuration: {e}")
            return False
    
    def _generate_datasources(self) -> bool:
        """
        Generate Grafana datasources
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Grafana datasources")
        
        try:
            # Prometheus datasource
            prometheus_ds = {
                "apiVersion": 1,
                "datasources": [
                    {
                        "name": "Prometheus",
                        "type": "prometheus",
                        "access": "proxy",
                        "url": "http://prometheus:9090",
                        "isDefault": True,
                        "editable": False
                    }
                ]
            }
            
            # Loki datasource
            loki_ds = {
                "apiVersion": 1,
                "datasources": [
                    {
                        "name": "Loki",
                        "type": "loki",
                        "access": "proxy",
                        "url": "http://loki:3100",
                        "editable": False
                    }
                ]
            }
            
            # Write datasources to files
            with open(self.config.datasources_path / "prometheus.yml", "w") as f:
                yaml.dump(prometheus_ds, f, default_flow_style=False)
            
            with open(self.config.datasources_path / "loki.yml", "w") as f:
                yaml.dump(loki_ds, f, default_flow_style=False)
            
            logger.info("Grafana datasources generated")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Grafana datasources: {e}")
            return False
    
    def _generate_dashboards(self) -> bool:
        """
        Generate Grafana dashboards
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Grafana dashboards")
        
        try:
            # Dashboard provider configuration
            dashboard_provider = {
                "apiVersion": 1,
                "providers": [
                    {
                        "name": "Default",
                        "folder": "",
                        "type": "file",
                        "disableDeletion": False,
                        "editable": True,
                        "options": {
                            "path": "/etc/grafana/dashboards"
                        }
                    }
                ]
            }
            
            # Write dashboard provider to file
            with open(self.config.grafana_path / "dashboard-providers.yml", "w") as f:
                yaml.dump(dashboard_provider, f, default_flow_style=False)
            
            # Generate system overview dashboard
            system_dashboard = self._generate_system_dashboard()
            with open(self.config.dashboards_path / "system-overview.json", "w") as f:
                json.dump(system_dashboard, f, indent=2)
            
            # Generate API performance dashboard
            api_dashboard = self._generate_api_dashboard()
            with open(self.config.dashboards_path / "api-performance.json", "w") as f:
                json.dump(api_dashboard, f, indent=2)
            
            # Generate error tracking dashboard
            error_dashboard = self._generate_error_dashboard()
            with open(self.config.dashboards_path / "error-tracking.json", "w") as f:
                json.dump(error_dashboard, f, indent=2)
            
            logger.info("Grafana dashboards generated")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Grafana dashboards: {e}")
            return False
    
    def _generate_system_dashboard(self) -> Dict[str, Any]:
        """
        Generate system overview dashboard
        
        Returns:
            Dashboard configuration
        """
        # This is a simplified version, a real implementation would be more comprehensive
        return {
            "annotations": {
                "list": [
                    {
                        "builtIn": 1,
                        "datasource": "-- Grafana --",
                        "enable": True,
                        "hide": True,
                        "iconColor": "rgba(0, 211, 255, 1)",
                        "name": "Annotations & Alerts",
                        "type": "dashboard"
                    }
                ]
            },
            "editable": True,
            "gnetId": None,
            "graphTooltip": 0,
            "id": None,
            "links": [],
            "panels": [
                {
                    "aliasColors": {},
                    "bars": False,
                    "dashLength": 10,
                    "dashes": False,
                    "datasource": "Prometheus",
                    "fill": 1,
                    "gridPos": {
                        "h": 8,
                        "w": 12,
                        "x": 0,
                        "y": 0
                    },
                    "id": 1,
                    "legend": {
                        "avg": False,
                        "current": False,
                        "max": False,
                        "min": False,
                        "show": True,
                        "total": False,
                        "values": False
                    },
                    "lines": True,
                    "linewidth": 1,
                    "links": [],
                    "nullPointMode": "null",
                    "percentage": False,
                    "pointradius": 5,
                    "points": False,
                    "renderer": "flot",
                    "seriesOverrides": [],
                    "spaceLength": 10,
                    "stack": False,
                    "steppedLine": False,
                    "targets": [
                        {
                            "expr": "process_cpu_seconds_total{job=~\".+\"}",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "{{job}}",
                            "refId": "A"
                        }
                    ],
                    "thresholds": [],
                    "timeFrom": None,
                    "timeShift": None,
                    "title": "CPU Usage",
                    "tooltip": {
                        "shared": True,
                        "sort": 0,
                        "value_type": "individual"
                    },
                    "type": "graph",
                    "xaxis": {
                        "buckets": None,
                        "mode": "time",
                        "name": None,
                        "show": True,
                        "values": []
                    },
                    "yaxes": [
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        },
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        }
                    ],
                    "yaxis": {
                        "align": False,
                        "alignLevel": None
                    }
                },
                {
                    "aliasColors": {},
                    "bars": False,
                    "dashLength": 10,
                    "dashes": False,
                    "datasource": "Prometheus",
                    "fill": 1,
                    "gridPos": {
                        "h": 8,
                        "w": 12,
                        "x": 12,
                        "y": 0
                    },
                    "id": 2,
                    "legend": {
                        "avg": False,
                        "current": False,
                        "max": False,
                        "min": False,
                        "show": True,
                        "total": False,
                        "values": False
                    },
                    "lines": True,
                    "linewidth": 1,
                    "links": [],
                    "nullPointMode": "null",
                    "percentage": False,
                    "pointradius": 5,
                    "points": False,
                    "renderer": "flot",
                    "seriesOverrides": [],
                    "spaceLength": 10,
                    "stack": False,
                    "steppedLine": False,
                    "targets": [
                        {
                            "expr": "process_resident_memory_bytes{job=~\".+\"}",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "{{job}}",
                            "refId": "A"
                        }
                    ],
                    "thresholds": [],
                    "timeFrom": None,
                    "timeShift": None,
                    "title": "Memory Usage",
                    "tooltip": {
                        "shared": True,
                        "sort": 0,
                        "value_type": "individual"
                    },
                    "type": "graph",
                    "xaxis": {
                        "buckets": None,
                        "mode": "time",
                        "name": None,
                        "show": True,
                        "values": []
                    },
                    "yaxes": [
                        {
                            "format": "bytes",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        },
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        }
                    ],
                    "yaxis": {
                        "align": False,
                        "alignLevel": None
                    }
                }
            ],
            "refresh": "5s",
            "schemaVersion": 16,
            "style": "dark",
            "tags": [],
            "templating": {
                "list": []
            },
            "time": {
                "from": "now-6h",
                "to": "now"
            },
            "timepicker": {
                "refresh_intervals": [
                    "5s",
                    "10s",
                    "30s",
                    "1m",
                    "5m",
                    "15m",
                    "30m",
                    "1h",
                    "2h",
                    "1d"
                ],
                "time_options": [
                    "5m",
                    "15m",
                    "1h",
                    "6h",
                    "12h",
                    "24h",
                    "2d",
                    "7d",
                    "30d"
                ]
            },
            "timezone": "",
            "title": "System Overview",
            "uid": "system-overview",
            "version": 1
        }
    
    def _generate_api_dashboard(self) -> Dict[str, Any]:
        """
        Generate API performance dashboard
        
        Returns:
            Dashboard configuration
        """
        # Simplified for brevity
        return {
            "annotations": {
                "list": [
                    {
                        "builtIn": 1,
                        "datasource": "-- Grafana --",
                        "enable": True,
                        "hide": True,
                        "iconColor": "rgba(0, 211, 255, 1)",
                        "name": "Annotations & Alerts",
                        "type": "dashboard"
                    }
                ]
            },
            "editable": True,
            "gnetId": None,
            "graphTooltip": 0,
            "id": None,
            "links": [],
            "panels": [
                {
                    "aliasColors": {},
                    "bars": False,
                    "dashLength": 10,
                    "dashes": False,
                    "datasource": "Prometheus",
                    "fill": 1,
                    "gridPos": {
                        "h": 8,
                        "w": 12,
                        "x": 0,
                        "y": 0
                    },
                    "id": 1,
                    "legend": {
                        "avg": False,
                        "current": False,
                        "max": False,
                        "min": False,
                        "show": True,
                        "total": False,
                        "values": False
                    },
                    "lines": True,
                    "linewidth": 1,
                    "links": [],
                    "nullPointMode": "null",
                    "percentage": False,
                    "pointradius": 5,
                    "points": False,
                    "renderer": "flot",
                    "seriesOverrides": [],
                    "spaceLength": 10,
                    "stack": False,
                    "steppedLine": False,
                    "targets": [
                        {
                            "expr": "http_request_duration_milliseconds{quantile=\"0.5\"}",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "p50 ({{path}})",
                            "refId": "A"
                        },
                        {
                            "expr": "http_request_duration_milliseconds{quantile=\"0.95\"}",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "p95 ({{path}})",
                            "refId": "B"
                        },
                        {
                            "expr": "http_request_duration_milliseconds{quantile=\"0.99\"}",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "p99 ({{path}})",
                            "refId": "C"
                        }
                    ],
                    "thresholds": [],
                    "timeFrom": None,
                    "timeShift": None,
                    "title": "API Response Time",
                    "tooltip": {
                        "shared": True,
                        "sort": 0,
                        "value_type": "individual"
                    },
                    "type": "graph",
                    "xaxis": {
                        "buckets": None,
                        "mode": "time",
                        "name": None,
                        "show": True,
                        "values": []
                    },
                    "yaxes": [
                        {
                            "format": "ms",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        },
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        }
                    ],
                    "yaxis": {
                        "align": False,
                        "alignLevel": None
                    }
                }
            ],
            "refresh": "5s",
            "schemaVersion": 16,
            "style": "dark",
            "tags": [],
            "templating": {
                "list": []
            },
            "time": {
                "from": "now-1h",
                "to": "now"
            },
            "timepicker": {
                "refresh_intervals": [
                    "5s",
                    "10s",
                    "30s",
                    "1m",
                    "5m",
                    "15m",
                    "30m",
                    "1h",
                    "2h",
                    "1d"
                ],
                "time_options": [
                    "5m",
                    "15m",
                    "1h",
                    "6h",
                    "12h",
                    "24h",
                    "2d",
                    "7d",
                    "30d"
                ]
            },
            "timezone": "",
            "title": "API Performance",
            "uid": "api-performance",
            "version": 1
        }
    
    def _generate_error_dashboard(self) -> Dict[str, Any]:
        """
        Generate error tracking dashboard
        
        Returns:
            Dashboard configuration
        """
        # Simplified for brevity
        return {
            "annotations": {
                "list": [
                    {
                        "builtIn": 1,
                        "datasource": "-- Grafana --",
                        "enable": True,
                        "hide": True,
                        "iconColor": "rgba(0, 211, 255, 1)",
                        "name": "Annotations & Alerts",
                        "type": "dashboard"
                    }
                ]
            },
            "editable": True,
            "gnetId": None,
            "graphTooltip": 0,
            "id": None,
            "links": [],
            "panels": [
                {
                    "aliasColors": {},
                    "bars": False,
                    "dashLength": 10,
                    "dashes": False,
                    "datasource": "Prometheus",
                    "fill": 1,
                    "gridPos": {
                        "h": 8,
                        "w": 24,
                        "x": 0,
                        "y": 0
                    },
                    "id": 1,
                    "legend": {
                        "avg": False,
                        "current": False,
                        "max": False,
                        "min": False,
                        "show": True,
                        "total": False,
                        "values": False
                    },
                    "lines": True,
                    "linewidth": 1,
                    "links": [],
                    "nullPointMode": "null",
                    "percentage": False,
                    "pointradius": 5,
                    "points": False,
                    "renderer": "flot",
                    "seriesOverrides": [],
                    "spaceLength": 10,
                    "stack": False,
                    "steppedLine": False,
                    "targets": [
                        {
                            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service)",
                            "format": "time_series",
                            "intervalFactor": 1,
                            "legendFormat": "{{service}}",
                            "refId": "A"
                        }
                    ],
                    "thresholds": [],
                    "timeFrom": None,
                    "timeShift": None,
                    "title": "Error Rate (5xx)",
                    "tooltip": {
                        "shared": True,
                        "sort": 0,
                        "value_type": "individual"
                    },
                    "type": "graph",
                    "xaxis": {
                        "buckets": None,
                        "mode": "time",
                        "name": None,
                        "show": True,
                        "values": []
                    },
                    "yaxes": [
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        },
                        {
                            "format": "short",
                            "label": None,
                            "logBase": 1,
                            "max": None,
                            "min": None,
                            "show": True
                        }
                    ],
                    "yaxis": {
                        "align": False,
                        "alignLevel": None
                    }
                }
            ],
            "refresh": "10s",
            "schemaVersion": 16,
            "style": "dark",
            "tags": [],
            "templating": {
                "list": []
            },
            "time": {
                "from": "now-1h",
                "to": "now"
            },
            "timepicker": {
                "refresh_intervals": [
                    "5s",
                    "10s",
                    "30s",
                    "1m",
                    "5m",
                    "15m",
                    "30m",
                    "1h",
                    "2h",
                    "1d"
                ],
                "time_options": [
                    "5m",
                    "15m",
                    "1h",
                    "6h",
                    "12h",
                    "24h",
                    "2d",
                    "7d",
                    "30d"
                ]
            },
            "timezone": "",
            "title": "Error Tracking",
            "uid": "error-tracking",
            "version": 1
        }


class LokiConfig:
    """Configuration generator for Loki logging"""
    
    def __init__(self, config: MonitoringConfig):
        """
        Initialize Loki configuration
        
        Args:
            config: Monitoring configuration
        """
        self.config = config
    
    def generate_config(self) -> bool:
        """
        Generate Loki configuration
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("Generating Loki configuration")
        
        try:
            loki_config = {
                "auth_enabled": False,
                "server": {
                    "http_listen_port": 3100
                },
                "ingester": {
                    "lifecycler": {
                        "address": "127.0.0.1",
                        "ring": {
                            "kvstore": {
                                "store": "inmemory"
                            },
                            "replication_factor": 1
                        },
                        "final_sleep": "0s"
                    },
                    "chunk_idle_period": "5m",
                    "chunk_retain_period": "30s"
                },
                "schema_config": {
                    "configs": [
                        {
                            "from": "2020-01-01",
                            "store": "boltdb",
                            "object_store": "filesystem",
                            "schema": "v11",
                            "index": {
                                "prefix": "index_",
                                "period": "24h"
                            }
                        }
                    ]
                },
                "storage_config": {
                    "boltdb": {
                        "directory": "/tmp/loki/index"
                    },
                    "filesystem": {
                        "directory": "/tmp/loki/chunks"
                    }
                },
                "limits_config": {
                    "enforce_metric_name": False,
                    "reject_old_samples": True,
                    "reject_old_samples_max_age": "168h"
                }
            }
            
            # Write configuration to file
            config_file = self.config.loki_path / "loki-config.yml"
            with open(config_file, "w") as f:
                yaml.dump(loki_config, f, default_flow_style=False)
            
            logger.info(f"Loki configuration generated: {config_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate Loki configuration: {e}")
            return False


# Main execution function
def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Auto AGI Builder Monitoring Configuration")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--output-dir", default="monitoring", help="Output directory for configuration files")
    
    args = parser.parse_args()
    
    # Initialize configuration
    config = MonitoringConfig(args.config)
    
    # Create directory structure
    if not config.setup_directory_structure():
        logger.error("Failed to create directory structure")
        sys.exit(1)
    
    # Generate Prometheus configuration
    prometheus_config = PrometheusConfig(config)
    if not prometheus_config.generate_config():
        logger.error("Failed to generate Prometheus configuration")
        sys.exit(1)
    
    # Generate AlertManager configuration
    alertmanager_config = AlertManagerConfig(config)
    if not alertmanager_config.generate_config():
        logger.error("Failed to generate AlertManager configuration")
        sys.exit(1)
    
    # Generate Grafana configuration
    grafana_config = GrafanaConfig(config)
    if not grafana_config.generate_config():
        logger.error("Failed to generate Grafana configuration")
        sys.exit(1)
    
    # Generate Loki configuration
    loki_config = LokiConfig(config)
    if not loki_config.generate_config():
        logger.error("Failed to generate Loki configuration")
        sys.exit(1)
    
    logger.info("Monitoring configuration generated successfully")
    logger.info(f"Configuration files located at: {config.base_path}")
    
    print(f"\nMonitoring configuration generated successfully at {config.base_path}")
    print("\nNext steps:")
    print("1. Start the monitoring stack using Docker Compose")
    print("2. Configure your applications to export metrics to Prometheus")
    print("3. Configure your applications to send logs to Loki")
    print("4. Access Grafana at http://localhost:3000 to view dashboards")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Configuration generation interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Configuration generation failed: {e}")
        sys.exit(1)
