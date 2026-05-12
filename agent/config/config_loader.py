import json


class ConfigLoader:

    @staticmethod
    def load():

        with open(
            "agent/config/config.json",
            "r"
        ) as f:

            return json.load(f)