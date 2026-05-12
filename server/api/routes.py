from fastapi import APIRouter

from server.database.db import SessionLocal
from server.models.schemas import Log, Alert

router = APIRouter()


@router.get("/health")
def health():

    return {
        "status": "healthy"
    }


@router.post("/logs")
def receive_logs(logs: list[dict]):

    db = SessionLocal()

    try:

        for log in logs:

            db_log = Log(

                timestamp=log.get("timestamp"),

                event_id=str(log.get("event_id")),
                event_name=log.get("event_name"),

                category=log.get("category"),
                severity=log.get("severity"),

                source=log.get("source"),
                logfile=log.get("logfile"),

                computer=log.get("computer"),

                target_user=log.get("target_user"),
                source_ip=log.get("source_ip"),

                process_name=log.get("process_name"),
                parent_process=log.get("parent_process"),

                object_name=log.get("object_name"),

                command_line=log.get("command_line"),

                message=log.get("message")
            )

            db.add(db_log)

        db.commit()

        return {
            "message": f"Stored {len(logs)} logs"
        }

    finally:

        db.close()


@router.post("/alerts")
def receive_alerts(alerts: list[dict]):

    db = SessionLocal()

    try:

        for alert in alerts:

            db_alert = Alert(
                rule_name=alert.get("rule_name"),
                severity=alert.get("severity"),
                description=alert.get("description"),
                trigger_time=alert.get("trigger_time")
            )

            db.add(db_alert)

        db.commit()

        return {
            "message": f"Stored {len(alerts)} alerts"
        }

    finally:

        db.close()


@router.get("/logs/recent")
def get_recent_logs():

    db = SessionLocal()

    try:

        logs = (
            db.query(Log)
            .order_by(Log.id.desc())
            .limit(100000)
            .all()
        )

        return [

            {
                "id":
                    log.id,

                "timestamp":
                    log.timestamp or "",

                "event_id":
                    log.event_id or "",

                "event_name":
                    log.event_name or "",

                "category":
                    log.category or "",

                "severity":
                    log.severity or "",

                "source":
                    log.source or "",

                "logfile":
                    log.logfile or "",

                "computer":
                    log.computer or "",

                "target_user":
                    log.target_user or "",

                "source_ip":
                    log.source_ip or "",

                "process_name":
                    log.process_name or "",

                "parent_process":
                    log.parent_process or "",

                "object_name":
                    log.object_name or "",

                "command_line":
                    log.command_line or "",

                "message":
                    log.message or ""
            }

            for log in logs
        ]

    finally:

        db.close()


@router.get("/alerts/recent")
def get_recent_alerts():

    db = SessionLocal()

    try:

        alerts = (
            db.query(Alert)
            .order_by(Alert.id.desc())
            .limit(1000)
            .all()
        )

        return [

            {
                "id": alert.id,
                "rule_name": alert.rule_name,
                "severity": alert.severity,
                "description": alert.description,
                "trigger_time": alert.trigger_time
            }

            for alert in alerts
        ]

    finally:

        db.close()


@router.get("/stats")
def get_stats():

    db = SessionLocal()

    try:

        total_logs = db.query(Log).count()

        total_alerts = db.query(Alert).count()

        critical_alerts = (
            db.query(Alert)
            .filter(Alert.severity == "critical")
            .count()
        )

        high_alerts = (
            db.query(Alert)
            .filter(Alert.severity == "high")
            .count()
        )

        return {
            "total_logs": total_logs,
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "high_alerts": high_alerts
        }

    finally:

        db.close()