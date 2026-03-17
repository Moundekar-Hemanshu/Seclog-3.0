import json
from datetime import datetime, timedelta


class RuleEngine:
    def __init__(self, rules_filepath="rules.json", db_handler=None):
        self.simple_rules = []
        self.correlation_rules = []
        self.db_handler = db_handler
        self.alert_cache = {}  # key -> last_trigger_time

        self.suppression_minutes = 2  # prevent alert spam

        self._load_rules(rules_filepath)

    def _load_rules(self, filepath):
        try:
            with open(filepath, 'r') as f:
                rules = json.load(f)

            for rule in rules:
                if not rule.get("enabled", False):
                    continue

                if rule.get("type") == "correlation":
                    self.correlation_rules.append(rule)
                else:
                    self.simple_rules.append(rule)

            print(f"Loaded {len(self.simple_rules)} simple rules")
            print(f"Loaded {len(self.correlation_rules)} correlation rules")

        except Exception as e:
            print(f"Error loading rules: {e}")

    # ---------------- DEDUP + SUPPRESSION ---------------- #

    def _is_suppressed(self, rule_name):
        now = datetime.now()

        if rule_name in self.alert_cache:
            last_time = self.alert_cache[rule_name]
            if now - last_time < timedelta(minutes=self.suppression_minutes):
                return True

        self.alert_cache[rule_name] = now
        return False

    # ---------------- SIMPLE RULES ---------------- #

    def check_simple_rules(self):
        alerts = []

        for rule in self.simple_rules:
            time_window = rule["aggregation"]["time_window_minutes"]
            threshold = rule["aggregation"]["threshold"]

            start_time = datetime.now() - timedelta(minutes=time_window)
            start_time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")

            log_count = self.db_handler.count_logs_for_rule(
                logfile=rule["logfile"],
                conditions=rule["conditions"],
                start_time=start_time_str
            )

            if log_count >= threshold:
                if self._is_suppressed(rule["rule_name"]):
                    continue

                alerts.append(self._build_alert(rule, log_count))

        return alerts

    # ---------------- CORRELATION RULES ---------------- #

    def check_correlation_rules(self):
        alerts = []

        for rule in self.correlation_rules:
            time_window = rule["time_window_minutes"]

            start_time = datetime.now() - timedelta(minutes=time_window)
            start_time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")

            all_steps_passed = True
            total_matches = 0

            for step in rule["steps"]:
                logfile = step.get("logfile", rule.get("logfile", "Security"))

                log_count = self.db_handler.count_logs_for_rule(
                    logfile=logfile,
                    conditions=step["conditions"],
                    start_time=start_time_str
                )

                if log_count < step.get("threshold", 1):
                    all_steps_passed = False
                    break

                total_matches += log_count

            if all_steps_passed:
                if self._is_suppressed(rule["rule_name"]):
                    continue

                alerts.append(self._build_alert(rule, total_matches))

        return alerts

    # ---------------- ALERT BUILDER ---------------- #

    def _build_alert(self, rule, count):
        return {
            "rule_name": rule["rule_name"],
            "description": rule.get("description", ""),
            "trigger_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "count": count,
            "severity": rule.get("severity", "low"),
            "mitre": rule.get("mitre", {})
        }

    # ---------------- MAIN ---------------- #

    def check_alerts(self):
        if not self.db_handler:
            return []

        alerts = self.check_simple_rules() + self.check_correlation_rules()

        # 🔥 SAVE ALERTS TO DB
        for alert in alerts:
            self.db_handler.insert_alert(alert)

        return alerts