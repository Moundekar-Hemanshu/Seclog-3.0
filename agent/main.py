import time

from agent.core.log_handler import LogHandler
from agent.core.rule_engine import RuleEngine
from agent.core.correlation_engine import CorrelationEngine
from agent.storage.database_handler import DatabaseHandler
from agent.services.api_client import APIClient


def real_time_callback(new_logs, counts, db_handler, rule_engine, correlation_engine, api_client):
    if not new_logs:
        return
    if len(new_logs) > 1000:
        print("[INFO] Ignoring historical startup logs")
        return

    print(f"\n[+] Received {len(new_logs)} new logs")

    # Store logs
    db_handler.insert_logs(new_logs)
    
    api_client.send_logs(new_logs)

    # Run detections
    simple_alerts = rule_engine.check_alerts()
    correlation_alerts = correlation_engine.check_correlations()

    all_alerts = simple_alerts + correlation_alerts

    if all_alerts:
        print(f"[ALERT] Generated {len(all_alerts)} alerts")

        api_client.send_alerts(all_alerts)

        for alert in all_alerts:
            print(f"""
==================================================
RULE: {alert.get('rule_name')}
SEVERITY: {alert.get('severity')}
TIME: {alert.get('trigger_time')}
DESCRIPTION: {alert.get('description')}
==================================================
""")


def main():
    print("[+] Starting SecLog Agent...")

    db_handler = DatabaseHandler()

    api_client = APIClient()

    log_handler = LogHandler()

    rule_engine = RuleEngine(
        db_handler=db_handler
    )

    correlation_engine = CorrelationEngine(
        db_handler=db_handler
    )

    print("[+] Agent initialized successfully")
    print(f"[+] Loaded {len(rule_engine.simple_rules)} simple rules")
    print(f"[+] Loaded {len(rule_engine.correlation_rules)} correlation rules")

    print("[+] Starting real-time monitoring...")

    log_handler.start_monitoring(
        lambda logs, counts:
            real_time_callback(
                logs,
                counts,
                db_handler,
                rule_engine,
                correlation_engine,
                api_client
            )
    )

    try:
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[+] Stopping SecLog Agent...")
        log_handler.stop_monitoring()


if __name__ == "__main__":
    main()