from pathlib import Path
import json
from datetime import datetime, timedelta


class CorrelationEngine:
    def __init__(self, rules_filepath=None, db_handler=None):
        if rules_filepath is None:
            base_dir = Path(__file__).resolve().parent.parent
            rules_filepath = base_dir / "rules" / "rules.json"
        self.correlation_rules = self._load_rules(rules_filepath)
        self.db_handler = db_handler
        self.alert_cache = {}

        self.suppression_minutes = 2

    def _load_rules(self, filepath):
        try:
            with open(filepath, 'r') as f:
                all_rules = json.load(f)

            corr_rules = [
                rule for rule in all_rules
                if rule.get("enabled", False) and rule.get("type") == "correlation"
            ]

            print(f"Successfully loaded {len(corr_rules)} correlation rules.")
            return corr_rules

        except Exception as e:
            print(f"Error loading correlation rules: {e}")
            return []

    # ---------------- SUPPRESSION ---------------- #

    def _is_suppressed(self, rule_name):
        now = datetime.now()

        if rule_name in self.alert_cache:
            last_time = self.alert_cache[rule_name]
            if now - last_time < timedelta(minutes=self.suppression_minutes):
                return True

        self.alert_cache[rule_name] = now
        return False

    # ---------------- CORRELATION ---------------- #

    def check_correlations(self):
        if not self.db_handler:
            return []

        #print("\n--- Checking for Correlations ---")
        triggered_alerts = []

        for rule in self.correlation_rules:
            #print(f"Checking correlation rule: '{rule['rule_name']}'")

            time_window = rule["time_window_minutes"]
            end_time = datetime.now()
            start_time = end_time - timedelta(minutes=time_window)

            all_steps_found = True
            total_matches = 0

            for step in rule["steps"]:
                logfile = step.get("logfile", rule.get("logfile", "Security"))

                log_count = self.db_handler.count_logs_for_rule(
                    logfile=logfile,
                    conditions=step["conditions"],
                    start_time=start_time.strftime("%Y-%m-%d %H:%M:%S")
                )

                threshold = step.get("threshold", 1)

                #print(f"  Step {step['conditions']} → Found {log_count} (Required {threshold})")

                if log_count < threshold:
                    all_steps_found = False
                    break

                total_matches += log_count

            if all_steps_found:
                if self._is_suppressed(rule["rule_name"]):
                    print("  ⏳ Suppressed duplicate alert")
                    continue

                print("  ✅ Correlation detected")

                alert = {
                    "rule_name": rule["rule_name"],
                    "description": rule.get("description", ""),
                    "trigger_time": end_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "severity": rule.get("severity", "medium"),
                    "mitre": rule.get("mitre", {}),
                    "matched_events": total_matches
                }

                triggered_alerts.append(alert)

            else:
                #print("  ❌ Not matched")
                pass

        return triggered_alerts