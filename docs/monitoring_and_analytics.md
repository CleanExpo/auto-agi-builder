# Monitoring and Analytics Configuration Guide

This guide provides detailed instructions for setting up production monitoring, logging, alerting, and analytics for the Auto AGI Builder platform.

## Table of Contents
1. [Monitoring Infrastructure](#monitoring-infrastructure)
2. [Infrastructure Monitoring](#infrastructure-monitoring)
3. [Application Monitoring](#application-monitoring)
4. [Error Tracking and Logging](#error-tracking-and-logging)
5. [Alerting Configuration](#alerting-configuration)
6. [User Analytics](#user-analytics)
7. [Dashboard Creation](#dashboard-creation)
8. [Security Monitoring](#security-monitoring)

## Monitoring Infrastructure

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Metrics Collection | Prometheus | Collect and store time-series metrics |
| Visualization | Grafana | Create dashboards and visualizations |
| Log Management | Loki | Collect and query logs |
| Alerting | AlertManager | Manage and route alerts |
| Error Tracking | Sentry | Track application errors in real-time |
| Uptime Monitoring | Uptime Robot | External availability monitoring |
| User Analytics | Plausible/Google Analytics | Track user behavior |

### Installation and Setup

#### Prometheus Setup

1. **Create Docker Compose Configuration**:
   ```yaml
   # docker-compose-monitoring.yml
   version: '3'
   
   services:
     prometheus:
       image: prom/prometheus:latest
       container_name: prometheus
       ports:
         - "9090:9090"
       volumes:
         - ./prometheus:/etc/prometheus
         - prometheus_data:/prometheus
       command:
         - '--config.file=/etc/prometheus/prometheus.yml'
         - '--storage.tsdb.path=/prometheus'
         - '--web.console.libraries=/etc/prometheus/console_libraries'
         - '--web.console.templates=/etc/prometheus/consoles'
         - '--web.enable-lifecycle'
       restart: unless-stopped
       networks:
         - monitoring
   
     grafana:
       image: grafana/grafana:latest
       container_name: grafana
       ports:
         - "3000:3000"
       volumes:
         - grafana_data:/var/lib/grafana
         - ./grafana/provisioning:/etc/grafana/provisioning
       environment:
         - GF_SECURITY_ADMIN_USER=admin
         - GF_SECURITY_ADMIN_PASSWORD=secure_password
         - GF_USERS_ALLOW_SIGN_UP=false
       restart: unless-stopped
       networks:
         - monitoring
   
     loki:
       image: grafana/loki:latest
       container_name: loki
       ports:
         - "3100:3100"
       volumes:
         - ./loki:/etc/loki
         - loki_data:/loki
       command: -config.file=/etc/loki/loki-config.yaml
       restart: unless-stopped
       networks:
         - monitoring
   
     alertmanager:
       image: prom/alertmanager:latest
       container_name: alertmanager
       ports:
         - "9093:9093"
       volumes:
         - ./alertmanager:/etc/alertmanager
       command:
         - '--config.file=/etc/alertmanager/alertmanager.yml'
         - '--storage.path=/alertmanager'
       restart: unless-stopped
       networks:
         - monitoring
   
   volumes:
     prometheus_data:
     grafana_data:
     loki_data:
   
   networks:
     monitoring:
       driver: bridge
   ```

2. **Create Prometheus Configuration**:
   ```yaml
   # prometheus/prometheus.yml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s
     scrape_timeout: 10s
   
   alerting:
     alertmanagers:
       - static_configs:
           - targets: ['alertmanager:9093']
   
   rule_files:
     - "rules/node_exporter_rules.yml"
     - "rules/api_rules.yml"
     - "rules/database_rules.yml"
   
   scrape_configs:
     # Backend API monitoring
     - job_name: 'api'
       metrics_path: '/metrics'
       static_configs:
         - targets: ['api.yourdomain.com']
     
     # Node monitoring for server
     - job_name: 'node'
       static_configs:
         - targets: ['node-exporter:9100']
     
     # Database monitoring
     - job_name: 'postgres'
       static_configs:
         - targets: ['postgres-exporter:9187']
     
     # Redis monitoring
     - job_name: 'redis'
       static_configs:
         - targets: ['redis-exporter:9121']
   ```

3. **Create Alert Rules**:
   ```yaml
   # prometheus/rules/api_rules.yml
   groups:
   - name: api_alerts
     rules:
     - alert: HighApiErrorRate
       expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
       for: 2m
       labels:
         severity: critical
       annotations:
         summary: "High API error rate (> 5%)"
         description: "API error rate is {{ $value | humanizePercentage }} for the last 5 minutes."
         
     - alert: ApiHighLatency
       expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "API high latency (95th percentile > 1s)"
         description: "API request latency is {{ $value }} seconds for the last 5 minutes."
   ```

4. **Deploy Monitoring Stack**:
   ```bash
   docker-compose -f docker-compose-monitoring.yml up -d
   ```

#### Configure Backend Applications

1. **Add Prometheus Metrics to FastAPI**:
   ```python
   # app/main.py
   from fastapi import FastAPI
   from prometheus_fastapi_instrumentator import Instrumentator
   
   app = FastAPI()
   
   # Setup Prometheus metrics
   Instrumentator().instrument(app).expose(app)
   ```

2. **Add Required Packages to `requirements.txt`**:
   ```
   prometheus-fastapi-instrumentator==5.9.1
   prometheus-client==0.14.1
   ```

#### Configure Frontend Monitoring

1. **Install Next.js Plugin**:
   ```bash
   cd frontend
   npm install next-plugin-prometheus-instrumentation
   ```

2. **Update Next.js Configuration**:
   ```javascript
   // next.config.js
   const { withPrometheusInstrumentation } = require('next-plugin-prometheus-instrumentation');
   
   module.exports = withPrometheusInstrumentation({
     // your existing Next.js config
   });
   ```

## Infrastructure Monitoring

### Server Metrics 

1. **Node Exporter Setup**:
   Add to your docker-compose file:
   ```yaml
   node-exporter:
     image: prom/node-exporter:latest
     container_name: node-exporter
     restart: unless-stopped
     volumes:
       - /proc:/host/proc:ro
       - /sys:/host/sys:ro
       - /:/rootfs:ro
     command:
       - '--path.procfs=/host/proc'
       - '--path.rootfs=/rootfs'
       - '--path.sysfs=/host/sys'
       - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
     ports:
       - "9100:9100"
     networks:
       - monitoring
   ```

2. **Create Server Dashboard in Grafana**:
   Import the Node Exporter Full dashboard (ID: 1860) in Grafana.

### Database Monitoring

1. **Postgres Exporter Setup**:
   Add to your docker-compose file:
   ```yaml
   postgres-exporter:
     image: prometheuscommunity/postgres-exporter:latest
     container_name: postgres-exporter
     environment:
       DATA_SOURCE_NAME: "postgresql://username:password@postgres:5432/dbname?sslmode=disable"
     ports:
       - "9187:9187"
     networks:
       - monitoring
   ```

2. **Redis Exporter Setup**:
   Add to your docker-compose file:
   ```yaml
   redis-exporter:
     image: oliver006/redis_exporter:latest
     container_name: redis-exporter
     environment:
       REDIS_ADDR: "redis:6379"
     ports:
       - "9121:9121"
     networks:
       - monitoring
   ```

### Network Monitoring

1. **Configure Network Metrics**:
   ```yaml
   # Add to prometheus.yml under scrape_configs
   - job_name: 'blackbox'
     metrics_path: /probe
     params:
       module: [http_2xx]
     static_configs:
       - targets:
         - https://yourdomain.com
         - https://api.yourdomain.com
     relabel_configs:
       - source_labels: [__address__]
         target_label: __param_target
       - source_labels: [__param_target]
         target_label: instance
       - target_label: __address__
         replacement: blackbox-exporter:9115
   ```

2. **Add Blackbox Exporter**:
   ```yaml
   blackbox-exporter:
     image: prom/blackbox-exporter:latest
     container_name: blackbox-exporter
     restart: unless-stopped
     ports:
       - "9115:9115"
     volumes:
       - ./blackbox:/config
     command:
       - '--config.file=/config/blackbox.yml'
     networks:
       - monitoring
   ```

3. **Configure Blackbox Exporter**:
   ```yaml
   # blackbox/blackbox.yml
   modules:
     http_2xx:
       prober: http
       timeout: 5s
       http:
         valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
         valid_status_codes: [200]
         method: GET
         no_follow_redirects: false
         fail_if_ssl: false
         fail_if_not_ssl: true
         tls_config:
           insecure_skip_verify: false
         preferred_ip_protocol: "ip4"
   ```

## Application Monitoring

### API Performance Metrics

1. **Configure FastAPI Middleware**:
   ```python
   # app/middleware/monitoring.py
   from fastapi import Request
   from prometheus_client import Counter, Histogram
   import time
   
   request_counter = Counter('http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
   request_duration = Histogram('http_request_duration_seconds', 'HTTP Request Duration', ['method', 'endpoint'])
   
   async def monitoring_middleware(request: Request, call_next):
       start_time = time.time()
       response = await call_next(request)
       duration = time.time() - start_time
       
       request_counter.labels(
           method=request.method, 
           endpoint=request.url.path, 
           status=response.status_code
       ).inc()
       
       request_duration.labels(
           method=request.method, 
           endpoint=request.url.path
       ).observe(duration)
       
       return response
   ```

2. **Add Middleware to FastAPI App**:
   ```python
   # app/main.py
   from app.middleware.monitoring import monitoring_middleware
   
   app.middleware("http")(monitoring_middleware)
   ```

### Database Performance Monitoring

1. **Add Database Query Timing Middleware**:
   ```python
   # app/db/monitoring.py
   from sqlalchemy.event import listen
   from sqlalchemy.engine import Engine
   from prometheus_client import Histogram
   import time
   
   query_duration = Histogram(
       'database_query_duration_seconds', 
       'Database Query Duration',
       ['query_type']
   )
   
   @listen(Engine, "before_cursor_execute")
   def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
       conn.info.setdefault('query_start_time', []).append(time.time())
   
   @listen(Engine, "after_cursor_execute")
   def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
       start_time = conn.info['query_start_time'].pop()
       duration = time.time() - start_time
       
       # Categorize query type
       query_type = statement.split(' ')[0].lower()
       if query_type not in ['select', 'insert', 'update', 'delete']:
           query_type = 'other'
           
       query_duration.labels(query_type=query_type).observe(duration)
   ```

2. **Initialize Database Monitoring**:
   ```python
   # app/db/session.py
   from app.db.monitoring import before_cursor_execute, after_cursor_execute
   # These imports activate the SQLAlchemy event listeners
   ```

### Frontend Performance Monitoring

1. **Add Web Vitals Monitoring**:
   ```javascript
   // frontend/lib/analytics.js
   import { getCLS, getFID, getLCP } from 'web-vitals';
   
   function sendMetric(metric) {
     const body = JSON.stringify({
       name: metric.name,
       value: metric.value,
       id: metric.id,
     });
     
     // Using Navigator.sendBeacon for non-blocking metric reports
     if (navigator.sendBeacon) {
       navigator.sendBeacon('/api/metrics/web-vitals', body);
     } else {
       fetch('/api/metrics/web-vitals', {
         body,
         method: 'POST',
         keepalive: true,
         headers: { 'Content-Type': 'application/json' },
       });
     }
   }
   
   export function initWebVitals() {
     getCLS(sendMetric);
     getFID(sendMetric);
     getLCP(sendMetric);
   }
   ```

2. **Add API Endpoint to Collect Metrics**:
   ```python
   # app/api/v1/endpoints/metrics.py
   from fastapi import APIRouter, Body
   from prometheus_client import Gauge
   
   router = APIRouter()
   
   # Create metrics gauges
   cls_metric = Gauge('web_vitals_cls', 'Cumulative Layout Shift')
   fid_metric = Gauge('web_vitals_fid', 'First Input Delay')
   lcp_metric = Gauge('web_vitals_lcp', 'Largest Contentful Paint')
   
   @router.post("/web-vitals")
   async def report_web_vitals(data: dict = Body(...)):
       name = data.get('name')
       value = data.get('value')
       
       if name == 'CLS':
           cls_metric.set(value)
       elif name == 'FID':
           fid_metric.set(value)
       elif name == 'LCP':
           lcp_metric.set(value)
       
       return {"status": "success"}
   ```

## Error Tracking and Logging

### Sentry Integration

1. **Backend Integration**:
   ```python
   # app/main.py
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   
   sentry_sdk.init(
       dsn="your_sentry_dsn",
       integrations=[FastApiIntegration()],
       traces_sample_rate=0.2,
       environment="production"
   )
   ```

2. **Frontend Integration**:
   ```javascript
   // frontend/pages/_app.js
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.2,
     environment: process.env.NODE_ENV
   });
   ```

### Structured Logging with Loki

1. **Configure Backend Logging**:
   ```python
   # app/core/logging.py
   import logging
   import json
   import sys
   from pythonjsonlogger import jsonlogger
   
   class CustomJsonFormatter(jsonlogger.JsonFormatter):
       def add_fields(self, log_record, record, message_dict):
           super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
           log_record['level'] = record.levelname
           log_record['logger'] = record.name
           log_record['timestamp'] = self.formatTime(record)
   
   def setup_logging():
       logger = logging.getLogger()
       handler = logging.StreamHandler(sys.stdout)
       formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
       handler.setFormatter(formatter)
       logger.addHandler(handler)
       logger.setLevel(logging.INFO)
       return logger
   ```

2. **Configure Docker Logging for Loki**:
   ```yaml
   # Updated docker-compose.yml for backend service
   services:
     api:
       # ... existing config
       logging:
         driver: loki
         options:
           loki-url: "http://loki:3100/loki/api/v1/push"
           loki-retries: "5"
           loki-batch-size: "400"
           labels: "job=api,environment=production"
   ```

3. **Configure Loki**:
   ```yaml
   # loki/loki-config.yaml
   auth_enabled: false
   
   server:
     http_listen_port: 3100
   
   ingester:
     lifecycler:
       address: 127.0.0.1
       ring:
         kvstore:
           store: inmemory
         replication_factor: 1
       final_sleep: 0s
     chunk_idle_period: 5m
     chunk_retain_period: 30s
   
   schema_config:
     configs:
     - from: 2020-10-24
       store: boltdb-shipper
       object_store: filesystem
       schema: v11
       index:
         prefix: index_
         period: 24h
   
   storage_config:
     boltdb_shipper:
       active_index_directory: /loki/boltdb-shipper-active
       cache_location: /loki/boltdb-shipper-cache
       cache_ttl: 24h
       shared_store: filesystem
     filesystem:
       directory: /loki/chunks
   
   limits_config:
     enforce_metric_name: false
     reject_old_samples: true
     reject_old_samples_max_age: 168h
   
   compactor:
     working_directory: /loki/boltdb-shipper-compactor
   ```

### Log Query Examples

Add these to your documentation for the operations team:

```
# Search for API errors
{job="api"} |= "error" | json | level="ERROR"

# Find slow database queries
{job="api"} |= "query" | json | duration > 1s

# Track user registration events
{job="api"} |= "user registered" | json

# Monitor authentication failures
{job="api"} |= "authentication failed" | json | user_id != ""
```

## Alerting Configuration

### AlertManager Setup

1. **Configure AlertManager**:
   ```yaml
   # alertmanager/alertmanager.yml
   global:
     resolve_timeout: 5m
     slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
   
   route:
     group_by: ['alertname', 'job']
     group_wait: 30s
     group_interval: 5m
     repeat_interval: 4h
     receiver: 'slack-notifications'
     routes:
     - match:
         severity: critical
       receiver: 'slack-critical'
       continue: true
     - match:
         severity: warning
       receiver: 'slack-notifications'
   
   receivers:
   - name: 'slack-critical'
     slack_configs:
     - channel: '#alerts-critical'
       send_resolved: true
       title: '{{ .GroupLabels.alertname }}'
       title_link: 'https://grafana.yourdomain.com/d/xyz/alerts'
       text: >-
         {{ range .Alerts }}
         *Alert:* {{ .Annotations.summary }}
         *Description:* {{ .Annotations.description }}
         *Severity:* {{ .Labels.severity }}
         {{ end }}
   
   - name: 'slack-notifications'
     slack_configs:
     - channel: '#alerts'
       send_resolved: true
       title: '{{ .GroupLabels.alertname }}'
       text: >-
         {{ range .Alerts }}
         *Alert:* {{ .Annotations.summary }}
         *Description:* {{ .Annotations.description }}
         *Severity:* {{ .Labels.severity }}
         {{ end }}
   
   inhibit_rules:
   - source_match:
       severity: 'critical'
     target_match:
       severity: 'warning'
     equal: ['alertname']
   ```

2. **Create Email Alerts Config**:
   ```yaml
   # Add to receivers in alertmanager.yml
   - name: 'email-alerts'
     email_configs:
     - to: 'team@yourdomain.com'
       from: 'alerts@yourdomain.com'
       smarthost: 'smtp.sendgrid.net:587'
       auth_username: 'apikey'
       auth_password: 'your_sendgrid_api_key'
       send_resolved: true
   ```

### Common Alert Definitions

1. **System Alerts**:
   ```yaml
   # prometheus/rules/node_exporter_rules.yml
   groups:
   - name: node_alerts
     rules:
     - alert: HighCPULoad
       expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "High CPU load (instance {{ $labels.instance }})"
         description: "CPU load is > 80%\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"
     
     - alert: HighMemoryUsage
       expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "High memory usage (instance {{ $labels.instance }})"
         description: "Memory usage is > 90%\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"
     
     - alert: LowDiskSpace
       expr: (node_filesystem_size_bytes{fstype!="tmpfs"} - node_filesystem_free_bytes{fstype!="tmpfs"}) / node_filesystem_size_bytes{fstype!="tmpfs"} * 100 > 85
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "Low disk space (instance {{ $labels.instance }})"
         description: "Disk usage is > 85%\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"
   ```

2. **Database Alerts**:
   ```yaml
   # prometheus/rules/database_rules.yml
   groups:
   - name: database_alerts
     rules:
     - alert: PostgresqlDown
       expr: pg_up == 0
       for: 1m
       labels:
         severity: critical
       annotations:
         summary: "PostgreSQL down (instance {{ $labels.instance }})"
         description: "PostgreSQL instance is down\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"
     
     - alert: PostgresqlHighConnections
       expr: sum by (datname) (pg_stat_activity_count) > 150
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "PostgreSQL high connections (instance {{ $labels.instance }})"
         description: "PostgreSQL instance has more than 150 connections for database {{ $labels.datname }}"
     
     - alert: PostgresqlSlowQueries
       expr: pg_stat_activity_max_tx_duration > 60
       for: 2m
       labels:
         severity: warning
       annotations:
         summary: "PostgreSQL slow queries (instance {{ $labels.instance }})"
         description: "PostgreSQL has queries running for more than 60 seconds"
   ```

## User Analytics

### Plausible Analytics Setup (Privacy-Focused Alternative)

1. **Add to Frontend**:
   ```html
   <!-- frontend/pages/_document.js -->
   <Head>
     {/* Plausible Analytics */}
     <script defer data-domain="yourdomain.com" src="https://plausible.io/js/plausible.js"></script>
   </Head>
   ```

2. **Setup Custom Events**:
   ```javascript
   // frontend/lib/analytics.js
   export function trackEvent(eventName, props = {}) {
     if (window.plausible) {
       window.plausible(eventName, { props });
     }
   }
   
   // Usage example
   // import { trackEvent } from 'lib/analytics';
   // trackEvent('UserRegistered', { source: 'organic' });
   ```

### Google Analytics Setup

1. **Add to Frontend**:
   ```javascript
   // frontend/pages/_app.js
   import Script from 'next/script';
   
   function MyApp({ Component, pageProps }) {
     return (
       <>
         {process.env.NODE_ENV === 'production' && (
           <>
             <Script
               strategy="afterInteractive"
               src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
             />
             <Script
               id="gtag-init"
               strategy="afterInteractive"
               dangerouslySetInnerHTML={{
                 __html: `
                   window.dataLayer = window.dataLayer || [];
                   function gtag(){dataLayer.push(arguments);}
                   gtag('js', new Date());
                   gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                     page_path: window.location.pathname,
                   });
                 `,
               }}
             />
           </>
         )}
         <Component {...pageProps} />
       </>
     );
   }
   ```

2. **Track Custom Events**:
   ```javascript
   // frontend/lib/analytics.js
   export function trackGAEvent(action, category, label, value) {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', action, {
         event_category: category,
         event_label: label,
         value: value,
       });
     }
   }
   ```

### Key User Journey Analytics

1. **Critical Events to Track**:
   - User Registration
   - Login Events
   - Feature Usage
   - Conversion Points
   - Subscription Changes
   - Time on Critical Pages

2. **Implementation Example**:
   ```javascript
   // frontend/components/AuthForm.js
   import { trackEvent } from 'lib/analytics';
   
   const handleSignup = async (data) => {
     try {
       const result = await api.post('/auth/register', data);
       trackEvent('UserRegistered', { 
         source: referralSource,
         plan: selectedPlan 
       });
       // rest of signup logic
     } catch (error) {
       trackEvent('RegistrationError', { 
         errorType: error.message 
       });
     }
   };
   ```

## Dashboard Creation

### System Dashboard

Create a new dashboard in Grafana with the following panels:

1. **System Health Overview**:
   - CPU Usage (Graph)
   - Memory Usage (Graph)
   - Disk Usage (Gauge)
   - Network Traffic (Graph)

2. **Query**:
   ```
   # CPU Usage
   100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   
   # Memory Usage
   (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
   
   # Disk Usage
   (node_filesystem_size_bytes{fstype!="tmpfs"} - node_filesystem_free_bytes{fstype!="tmpfs"}) / node_filesystem_size_bytes{fstype!="tmpfs"} * 100
   
   # Network Traffic
   sum by(instance) (irate(node_network_receive_bytes_total[5m]))
   sum by(instance) (irate(node_network_transmit_bytes_total[5m]))
   ```

### API Performance Dashboard

Create a new dashboard in Grafana with the following panels:

1. **API Performance Overview**:
   - Request Rate (Graph)
   - Error Rate (Graph)
   - P95 Latency (Graph)
   - Active Sessions (Stat)

2. **Query**:
   ```
   # Request Rate
   sum(rate(http_requests_total[5m])) by (endpoint)
   
   # Error Rate
   sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
   
   # P95 Latency
   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, endpoint))
   
   # Active Sessions (if using a session store)
   sum(sessions_active)
   ```

### Business Metrics Dashboard

Create a new dashboard in Grafana with the following panels:

1. **User Metrics**:
   - New Users (Graph)
   - Daily Active Users (Graph)
   - User Retention (Heatmap)
   - Conversion Rate (Gauge)

2. **Revenue Metrics**:
   - Monthly Recurring Revenue (Graph)
   - Average Revenue Per User (Stat)
   - Subscription Churn (Graph)
   - Lifetime Value (Stat)

### Example Dashboard JSON

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "datasource": null,
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "smooth",
            "lineWidth": 2,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "show
