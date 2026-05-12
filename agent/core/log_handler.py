import json
import os
import threading
import time
from collections import Counter

import requests

import win32evtlog
import win32evtlogutil

from agent.config.config_loader import ConfigLoader

from agent.core.normalizer import normalize_event
from agent.core.rule_engine import RuleEngine

CONFIG_PATH = os.path.join(

    os.path.dirname(
        os.path.dirname(__file__)
    ),

    "config",

    "config.json"
)

with open(

    CONFIG_PATH,

    "r"

) as f:

    config = json.load(f)

SERVER_URL = config.get(

    "server_url",

    "http://127.0.0.1:8000"
)


class LogHandler:

    def __init__(self):

        self.monitoring = False
        self.monitor_thread = None

        self.config = ConfigLoader.load()

        self.server_url = (
            self.config["server_url"]
        )

        self.rule_engine = RuleEngine()

        self.important_events = set(
            self.config["important_event_ids"]
        )

        #self.whitelist = self.load_whitelist()

    # --------------------------------------------------
    # LOAD WHITELIST
    # --------------------------------------------------

    # def load_whitelist(self):

    #     try:

    #         with open(
    #             "agent/config/whitelist.json",
    #             "r"
    #         ) as f:

    #             return json.load(f)

    #     except Exception as e:

    #         print(
    #             f"[WARNING] Failed to load whitelist: {e}"
    #         )

    #         return {
    #             "process_whitelist": [],
    #             "object_whitelist": []
    #         }

    # --------------------------------------------------
    # SEND ALERTS
    # --------------------------------------------------

    def send_alerts(self, alerts):

        try:

            requests.post(

                f"{self.server_url}/alerts",

                json=alerts,

                timeout=5
            )

            print(
                f"[ALERT API] "
                f"Sent {len(alerts)} alerts"
            )

        except Exception as e:

            print(
                f"[ERROR] Failed "
                f"to send alerts: {e}"
            )

    # --------------------------------------------------
    # FETCH INITIAL LOGS
    # --------------------------------------------------

    def fetch_logs(self):

        all_logs = []

        counts = Counter()

        log_files = self.config["enabled_logs"]

        for log_file in log_files:

            try:

                hand = win32evtlog.OpenEventLog(
                    None,
                    log_file
                )

                flags = (
                    win32evtlog.EVENTLOG_BACKWARDS_READ
                    | win32evtlog.EVENTLOG_SEQUENTIAL_READ
                )

                events = win32evtlog.ReadEventLog(
                    hand,
                    flags,
                    0
                )

                if events:

                    for ev_obj in events[:50]:

                        try:

                            message = (
                                win32evtlogutil
                                .SafeFormatMessage(
                                    ev_obj,
                                    log_file
                                )
                            )

                        except:

                            message = (
                                "Message formatting failed"
                            )

                        record = {

                            "EventID":
                                ev_obj.EventID & 0xFFFF,

                            "EventType":
                                ev_obj.EventType,

                            "SourceName":
                                log_file,

                            "TimeGenerated":
                                str(ev_obj.TimeGenerated),

                            "Message":
                                message,

                            "LogFile":
                                log_file
                        }

                        try:

                            normalized_record = (
                                normalize_event(record)
                            )

                        except Exception as e:

                            print(
                                f"[NORMALIZE ERROR] "
                                f"{log_file}: {e}"
                            )

                            continue

                        process_name = (
                            normalized_record
                            .get("process_name", "")
                            .lower()
                        )

                        object_name = (
                            normalized_record
                            .get("object_name", "")
                            .lower()
                        )

                        # if any(

                        #     proc in process_name

                        #     for proc in self.whitelist[
                        #         "process_whitelist"
                        #     ]

                        # ):

                        #     continue

                        # if any(

                        #     obj in object_name

                        #     for obj in self.whitelist[
                        #         "object_whitelist"
                        #     ]

                        # ):

                        #     continue

                        normalized_record[
                            "logfile"
                        ] = log_file

                        all_logs.append(
                            normalized_record
                        )

                        alerts = (
                            self.rule_engine.process(
                                normalized_record
                            )
                        )

                        if alerts:

                            self.send_alerts(alerts)

                        counts[log_file] += 1

            except Exception as e:

                print(
                    f"[ERROR] Failed reading "
                    f"{log_file}: {e}"
                )

        return all_logs, counts

    # --------------------------------------------------
    # START MONITORING
    # --------------------------------------------------

    def start_monitoring(self, update_callback):

        self.monitoring = True

        self.monitor_thread = threading.Thread(

            target=self._monitor_loop,

            args=(update_callback,),

            daemon=True
        )

        self.monitor_thread.start()

    # --------------------------------------------------
    # STOP MONITORING
    # --------------------------------------------------

    def stop_monitoring(self):

        self.monitoring = False

    # --------------------------------------------------
    # REALTIME LOOP
    # --------------------------------------------------

    def _monitor_loop(self, update_callback):

        last_record_numbers = {}

        log_files = self.config["enabled_logs"]

        print(
            "[INFO] Starting realtime monitoring"
        )

        while self.monitoring:

            new_logs = []

            counts = Counter()

            for log_file in log_files:

                try:

                    log_handle = (
                        win32evtlog.OpenEventLog(
                            None,
                            log_file
                        )
                    )

                    flags = (
                        win32evtlog.EVENTLOG_BACKWARDS_READ
                        | win32evtlog.EVENTLOG_SEQUENTIAL_READ
                    )

                    latest_flags = (
                        win32evtlog.EVENTLOG_BACKWARDS_READ
                        | win32evtlog.EVENTLOG_SEQUENTIAL_READ
                    )

                    latest_events = (
                        win32evtlog.ReadEventLog(
                            log_handle,
                            latest_flags,
                            0
                        )
                    )

                    if not latest_events:
                        continue

                    latest_record = (
                        latest_events[0]
                        .RecordNumber
                    )

                    if (
                        log_file
                        not in last_record_numbers
                    ):

                        last_record_numbers[
                            log_file
                        ] = latest_record

                        print(

                            f"[INFO] Initialized "

                            f"{log_file} "

                            f"at record "

                            f"{latest_record}"
                        )

                    last_seen_num = (
                        last_record_numbers[
                            log_file
                        ]
                    )

                    events = (
                        win32evtlog.ReadEventLog(
                            log_handle,
                            flags,
                            0
                        )
                    )

                    if events:

                        for ev_obj in events:

                            record_number = (
                                ev_obj.RecordNumber
                            )

                            if (
                                record_number
                                <= last_seen_num
                            ):

                                continue

                            try:

                                message = (
                                    win32evtlogutil
                                    .SafeFormatMessage(
                                        ev_obj,
                                        log_file
                                    )
                                )

                            except:

                                message = (
                                    "Message formatting failed"
                                )

                            record = {

                                "EventID":
                                    ev_obj.EventID
                                    & 0xFFFF,

                                "EventType":
                                    ev_obj.EventType,

                                "SourceName":
                                    log_file,

                                "TimeGenerated":
                                    str(
                                        ev_obj
                                        .TimeGenerated
                                    ),

                                "Message":
                                    message,

                                "LogFile":
                                    log_file
                            }

                            try:

                                normalized_record = (
                                    normalize_event(
                                        record
                                    )
                                )

                            except Exception as e:

                                print(
                                    f"[NORMALIZE ERROR] "
                                    f"{log_file}: {e}"
                                )

                                continue

                            process_name = (
                                normalized_record
                                .get("process_name", "")
                                .lower()
                            )

                            object_name = (
                                normalized_record
                                .get("object_name", "")
                                .lower()
                            )

                            # if any(

                            #     proc in process_name

                            #     for proc in self.whitelist[
                            #         "process_whitelist"
                            #     ]

                            # ):

                            #     continue

                            # if any(

                            #     obj in object_name

                            #     for obj in self.whitelist[
                            #         "object_whitelist"
                            #     ]

                            # ):

                            #     continue

                            normalized_record[
                                "logfile"
                            ] = log_file

                            new_logs.append(
                                normalized_record
                            )

                            alerts = (
                                self.rule_engine
                                .process(
                                    normalized_record
                                )
                            )

                            if alerts:

                                self.send_alerts(
                                    alerts
                                )

                            counts[log_file] += 1

                            last_record_numbers[
                                log_file
                            ] = record_number

                except Exception as e:

                    print(

                        f"[ERROR] Monitoring "

                        f"failed for "

                        f"{log_file}: {e}"
                    )

            if new_logs:

                print(

                    f"\n[+] Received "

                    f"{len(new_logs)} new logs"
                )

                update_callback(
                    new_logs,
                    counts
                )

            time.sleep(
                self.config["poll_interval"]
            )