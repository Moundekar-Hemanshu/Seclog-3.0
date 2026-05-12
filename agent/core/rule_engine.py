from pathlib import Path
import json

from datetime import datetime, timedelta


class RuleEngine:

    def __init__(self, rules_filepath=None, db_handler=None):

        self.simple_rules = []
        self.correlation_rules = []

        self.db_handler = db_handler

        self.alert_cache = {}

        self.suppression_minutes = 2

        if rules_filepath is None:

            base_dir = Path(__file__).resolve().parent.parent

            rules_filepath = (
                base_dir / "rules" / "rules.json"
            )

        self._load_rules(rules_filepath)

    # --------------------------------------------------
    # LOAD RULES
    # --------------------------------------------------

    def _load_rules(self, filepath):

        try:

            with open(filepath, "r") as f:

                rules = json.load(f)

            for rule in rules:

                if not rule.get("enabled", False):
                    continue

                if rule.get("type") == "correlation":

                    self.correlation_rules.append(rule)

                else:

                    self.simple_rules.append(rule)

            print(
                f"Loaded {len(self.simple_rules)} simple rules"
            )

            print(
                f"Loaded {len(self.correlation_rules)} "
                f"correlation rules"
            )

        except Exception as e:

            print(f"Error loading rules: {e}")

    # --------------------------------------------------
    # ALERT SUPPRESSION
    # --------------------------------------------------

    def _is_suppressed(self, rule_name):

        now = datetime.now()

        if rule_name in self.alert_cache:

            last_time = self.alert_cache[rule_name]

            if (
                now - last_time
                < timedelta(minutes=self.suppression_minutes)
            ):

                return True

        self.alert_cache[rule_name] = now

        return False

    # --------------------------------------------------
    # LIVE EVENT DETECTION
    # --------------------------------------------------

    def process(self, log):

        alerts = []

        event_id = str(
            log.get("event_id", "")
        )

        process_name = (
            log.get("process_name", "") or ""
        ).lower()

        target_user = (
            log.get("target_user", "") or ""
        )

        object_name = (
            log.get("object_name", "") or ""
        )

        # ------------------------------------------
        # PowerShell Detection
        # ------------------------------------------

        if "powershell.exe" in process_name:

            if not self._is_suppressed(
                "PowerShell Execution"
            ):

                alerts.append({

                    "rule_name":
                        "PowerShell Execution",

                    "severity":
                        "high",

                    "description":
                        f"PowerShell executed by "
                        f"{target_user}",

                    "trigger_time":
                        datetime.now().strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                })

        # ------------------------------------------
        # File Deletion Detection
        # ------------------------------------------

        if event_id == "4660":

            if not self._is_suppressed(
                "File Deletion"
            ):

                alerts.append({

                    "rule_name":
                        "File Deletion",

                    "severity":
                        "medium",

                    "description":
                        f"File deleted: "
                        f"{object_name}",

                    "trigger_time":
                        datetime.now().strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                })

        # ------------------------------------------
        # Suspicious Script Execution
        # ------------------------------------------

        if "__psscriptpolicytest" in object_name.lower():

            if not self._is_suppressed(
                "PowerShell Script Activity"
            ):

                alerts.append({

                    "rule_name":
                        "PowerShell Script Activity",

                    "severity":
                        "high",

                    "description":
                        f"Suspicious PowerShell "
                        f"script artifact detected",

                    "trigger_time":
                        datetime.now().strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                })

        return alerts

    # --------------------------------------------------
    # SIMPLE RULES
    # --------------------------------------------------

    def check_simple_rules(self):

        if not self.db_handler:
            return []

        alerts = []

        for rule in self.simple_rules:

            time_window = (
                rule["aggregation"]
                ["time_window_minutes"]
            )

            threshold = (
                rule["aggregation"]
                ["threshold"]
            )

            start_time = (
                datetime.now()
                - timedelta(minutes=time_window)
            )

            start_time_str = start_time.strftime(
                "%Y-%m-%d %H:%M:%S"
            )

            log_count = (
                self.db_handler.count_logs_for_rule(
                    logfile=rule["logfile"],
                    conditions=rule["conditions"],
                    start_time=start_time_str
                )
            )

            if log_count >= threshold:

                if self._is_suppressed(
                    rule["rule_name"]
                ):

                    continue

                alerts.append(
                    self._build_alert(
                        rule,
                        log_count
                    )
                )

        return alerts

    # --------------------------------------------------
    # CORRELATION RULES
    # --------------------------------------------------

    def check_correlation_rules(self):

        if not self.db_handler:
            return []

        alerts = []

        for rule in self.correlation_rules:

            time_window = (
                rule["time_window_minutes"]
            )

            start_time = (
                datetime.now()
                - timedelta(minutes=time_window)
            )

            start_time_str = start_time.strftime(
                "%Y-%m-%d %H:%M:%S"
            )

            all_steps_passed = True

            total_matches = 0

            for step in rule["steps"]:

                logfile = step.get(
                    "logfile",
                    rule.get("logfile", "Security")
                )

                log_count = (
                    self.db_handler.count_logs_for_rule(
                        logfile=logfile,
                        conditions=step["conditions"],
                        start_time=start_time_str
                    )
                )

                if log_count < step.get(
                    "threshold",
                    1
                ):

                    all_steps_passed = False
                    break

                total_matches += log_count

            if all_steps_passed:

                if self._is_suppressed(
                    rule["rule_name"]
                ):

                    continue

                alerts.append(
                    self._build_alert(
                        rule,
                        total_matches
                    )
                )

        return alerts

    # --------------------------------------------------
    # ALERT BUILDER
    # --------------------------------------------------

    def _build_alert(self, rule, count):

        return {

            "rule_name":
                rule["rule_name"],

            "description":
                rule.get("description", ""),

            "trigger_time":
                datetime.now().strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

            "count":
                count,

            "severity":
                rule.get("severity", "low"),

            "mitre":
                rule.get("mitre", {})
        }

    # --------------------------------------------------
    # MAIN
    # --------------------------------------------------

    def check_alerts(self):

        if not self.db_handler:
            return []

        alerts = (
            self.check_simple_rules()
            + self.check_correlation_rules()
        )

        for alert in alerts:

            self.db_handler.insert_alert(alert)

        return alerts