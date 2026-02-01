# SecLog 3.0 — Windows Security Log Monitoring & Alerting Platform

## SecLog 3.0 is a lightweight, desktop-based Windows Security Log Monitoring and Incident Management platform built with Python and CustomTkinter.

It provides real-time Windows Event Log collection, rule-based and correlation-based alerting, visual dashboards, and incident lifecycle management — similar to a mini SIEM for local systems.

## Features
### Secure Login

* Local authentication using bcrypt-hashed passwords
* User data stored in data/users.json
* Login required before accessing the dashboard

---

### Windows Event Log Collection

- Reads from:

    * Security
    * System
    * Application

- Supports:

    * Historical search (date range + keyword)
    * Real-time monitoring (polls every 3 seconds)
* Requires Administrator privileges to access Security logs

---

### Interactive Dashboard

- Total log counters by source
- Timeline graph (last 24 hours)
- Logs viewer with severity highlighting
- Summary panels:
    - Event IDs
    - Sources
    - Event types

Built using:
- CustomTkinter
- Matplotlib

---

### Rule-Based Alerts

Alerts are driven by rules.json.

Supported:

- Threshold + time window aggregation

- Per-logfile conditions

Example detections:

- Multiple failed logins (4625)

- User account lockout (4740)

- Security log cleared (1102)

- Software installation (11707)

---

### Correlation Engine

Supports multi-step correlation rules.

Example:

- 3 failed logins (4625)

- Followed by 1 successful login (4624)

- Within 10 minutes

Useful for detecting brute-force + compromise patterns.

---

### Incident Management

From any alert you can:

- Create an Incident
- Track status:
    - Open
    - Acknowledged
    - Closed

All incidents are stored locally in SQLite.

---

### Local Database + Retention

Uses SQLite (`data/seclog.db`) with tables:

-  `logs`
- `incidents`

Features:

- Automatic 30-day retention
- Older logs are archived to compressed CSV:

`data/logs_archive/*.csv.gz`


- Indexed for performance
- Duplicate events prevented via UNIQUE constraints

---

### Export

Filtered logs can be exported to CSV directly from the UI.

---

### Theme Support

- Light / Dark toggle

- Follows system appearance by default

---

## Architecture Overview
run.py <br>
 └── LoginWindow <br>
&emsp;&emsp;└── UserAuthenticator <br>
&emsp;&emsp;&emsp;&emsp;&emsp;↓ <br>
&emsp;&emsp;&emsp;&emsp;SecurityLogApp <br>
&emsp;&emsp;&emsp;&emsp;├── LogHandler (Windows Event Logs + real-time) <br>
&emsp;&emsp;&emsp;&emsp;├── DatabaseHandler (SQLite + archival) <br>
&emsp;&emsp;&emsp;&emsp;├── RuleEngine (simple rules) <br>
&emsp;&emsp;&emsp;&emsp;├── CorrelationEngine (multi-step rules) <br>
&emsp;&emsp;&emsp;&emsp;├── AlertManager <br>
&emsp;&emsp;&emsp;&emsp;└── UI Components (dashboard, logs, incidents) <br>

## Project Structure
Seclog-3.0/<br>
├── run.py<br>
├── main_app.py<br>
├── ui_components.py<br>
├── rules.json<br>
└── modules/<br>
&emsp;&emsp;   ├── user_auth.py<br>
&emsp;&emsp;   ├── log_handler.py<br>
&emsp;&emsp;   ├── database_handler.py<br>
&emsp;&emsp;   ├── rule_engine.py<br>
&emsp;&emsp;   ├── correlation_engine.py<br>
&emsp;&emsp;   ├── alert_manager.py<br>
&emsp;&emsp;   └── log_normalizer.py<br>
└── data/<br>
&emsp;&emsp;    ├── users.json<br>
&emsp;&emsp;    ├── seclog.db<br>
&emsp;&emsp;    └── logs_archive/<br>

## Requirements

- Windows OS
- Python 3.8+
- Administrator privileges (for Security logs)

- Python packages:
    - customtkinter
    - pywin32
    - matplotlib
    - bcrypt
    - pillow
    - psutil

Install:
```bash
pip install customtkinter pywin32 matplotlib bcrypt pillow psutil
```
Then Create User:
```bash
python create_admin.py
```
Then run:
```bash
python run.py
```

After installing pywin32, also run:
```bash
python -m pywin32_postinstall
```
## Getting Started

1. Clone
```bash
git clone https://github.com/Moundekar-Hemanshu/Seclog-3.0.git
cd Seclog-3.0
```
2. Install dependencies
```bash
pip install customtkinter pywin32 matplotlib bcrypt pillow psutil
```
3. Run
```bash
python run.py
```

Run terminal as Administrator for full log access.

4. Login

Users are stored in:

`data/users.json`

Create users via `UserAuthenticator.create_user()` or a helper script.

## Rules Configuration

Rules live in `rules.json`.

Two types:
```json
Simple Rule
{
  "rule_name": "...",
  "logfile": "Security",
  "conditions": { "event_id": "4625" },
  "aggregation": {
    "threshold": 3,
    "time_window_minutes": 5
  }
}
```
Correlation Rule
```json
{
  "type": "correlation",
  "steps": [...]
}
```

Supports chained detection across multiple events.

## Roadmap

- Remote log ingestion
- Role-based access
- Alert notifications (email / webhook)
- MITRE ATT&CK mapping
- Visual correlation graphs
- REST API
- Packaging as Windows executable

## Disclaimer

This project is for educational and research purposes.
Not intended as a production SIEM replacement.
