import re


EVENT_NAMES = {
    4624: "Successful Login",
    4625: "Failed Login",
    4634: "Logoff",

    4663: "File Access",
    4660: "File Deleted",

    4672: "Admin Privileges Assigned",

    4688: "Process Created",

    4697: "Service Installed",

    4740: "Account Locked",

    1102: "Security Logs Cleared",

    4104: "PowerShell Script Executed",

    7045: "Windows Service Created"
}


EVENT_CATEGORIES = {
    4624: "Authentication",
    4625: "Authentication",
    4634: "Authentication",

    4663: "File Activity",
    4660: "File Activity",

    4672: "Privilege Escalation",

    4688: "Process Activity",

    4697: "Persistence",

    4740: "Account Management",

    1102: "Defense Evasion",

    4104: "PowerShell",

    7045: "Persistence"
}


EVENT_SEVERITY = {
    4624: "low",
    4625: "medium",
    4634: "low",

    4663: "medium",
    4660: "high",

    4672: "high",

    4688: "medium",

    4697: "high",

    4740: "medium",

    1102: "critical",

    4104: "high",

    7045: "high"
}


MITRE_MAPPING = {
    4625: "T1110",
    4688: "T1059",
    4697: "T1543",
    7045: "T1543",
    1102: "T1070",
    4660: "T1485",
    4663: "T1005"
}


def extract_field(pattern, text):

    match = re.search(
        pattern,
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return None


def normalize_event(record):

    event_id = int(
        record.get("EventID", 0)
    )

    message = record.get(
        "Message",
        ""
    )

    # ----------------------------------------
    # SAFE EXTRACTIONS
    # ----------------------------------------

    computer = record.get(
        "Computer",
        "Unknown"
    )

    target_user = extract_field(
        r"Account Name:\s+([^\r\n]+)",
        message
    )

    source_ip = extract_field(
        r"Source Network Address:\s+([^\r\n]+)",
        message
    )

    process_name = extract_field(
        r"Process Name:\s+([^\r\n]+)",
        message
    )

    parent_process = extract_field(
        r"Parent Process Name:\s+([^\r\n]+)",
        message
    )

    command_line = extract_field(
        r"Command Line:\s+([^\r\n]+)",
        message
    )

    object_name = extract_field(
        r"Object Name:\s+([^\r\n]+)",
        message
    )

    # ----------------------------------------
    # NORMALIZED OUTPUT
    # ----------------------------------------

    normalized = {

        "timestamp":
            str(
                record.get(
                    "TimeGenerated",
                    ""
                )
            ),

        "event_id":
            str(event_id),

        "event_name":
            EVENT_NAMES.get(
                event_id,
                "Unknown Event"
            ),

        "category":
            EVENT_CATEGORIES.get(
                event_id,
                "General"
            ),

        "severity":
            EVENT_SEVERITY.get(
                event_id,
                "low"
            ),

        "mitre_technique":
            MITRE_MAPPING.get(
                event_id,
                ""
            ),

        "source":
            record.get(
                "SourceName",
                "Unknown"
            ),

        "logfile":
            record.get(
                "LogFile",
                "Unknown"
            ),

        # SYSTEM
        "computer":
            computer or "Unknown",

        # USER
        "target_user":
            target_user or "",

        "source_ip":
            source_ip or "",

        # PROCESS
        "process_name":
            process_name or "",

        "parent_process":
            parent_process or "",

        "command_line":
            command_line or "",

        # FILE / OBJECT
        "object_name":
            object_name or "",

        # RAW MESSAGE
        "message":
            message or ""
    }

    return normalized