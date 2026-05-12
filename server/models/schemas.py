from sqlalchemy import Column, Integer, String, Text

from server.database.db import Base


class Log(Base):

    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(String)

    event_id = Column(String)
    event_name = Column(String)

    category = Column(String)
    severity = Column(String)

    source = Column(String)
    logfile = Column(String)

    computer = Column(String)

    target_user = Column(String)
    source_ip = Column(String)

    process_name = Column(String)
    parent_process = Column(String)

    object_name = Column(String)

    command_line = Column(Text)

    message = Column(Text)

class Alert(Base):

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    rule_name = Column(String)
    severity = Column(String)
    description = Column(Text)
    trigger_time = Column(String)