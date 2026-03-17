from api.services.db import db
from modules.alert_manager import AlertManager

# Alert manager (still in-memory for now)
alert_manager = AlertManager()


def fetch_alerts():
    return db.get_all_alerts()


def fetch_logs():
    logs, _ = db.query_logs()
    
    # LIMIT response size
    return {
    "count": len(logs),
    "returned": len(logs[:100]),
    "data": logs[:100]
    }


def fetch_incidents():
    return db.get_all_incidents()