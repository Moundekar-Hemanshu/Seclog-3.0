from fastapi import FastAPI
from api.routes import alerts, logs, incidents

app = FastAPI(title="SecLog API")

app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])


@app.get("/")
def root():
    return {"message": "SecLog API running"}