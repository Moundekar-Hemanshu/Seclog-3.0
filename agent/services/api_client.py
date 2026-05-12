import requests
import json
import os

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

class APIClient:

    def __init__(self):
        self.server_url = config.get(

        "server_url",

        "http://127.0.0.1:8000"
    )
    def send_logs(self, logs):

        try:

            serialized_logs = json.loads(
                json.dumps(
                    logs,
                    default=str
                )
            )

            response = requests.post(
                f"{self.server_url}/logs",
                json=serialized_logs,
                timeout=5
            )

            print(f"[API] Logs sent: {response.status_code}")

        except Exception as e:

            print(f"[API ERROR] Failed to send logs: {e}")
            
    def send_alerts(self, alerts):

        try:

            serialized_alerts = json.loads(
                json.dumps(
                    alerts,
                    default=str
                )
            )

            response = requests.post(
                f"{self.server_url}/alerts",
                json=serialized_alerts,
                timeout=5
            )

            print(f"[API] Alerts sent: {response.status_code}")

        except Exception as e:

            print(f"[API ERROR] Failed to send alerts: {e}")