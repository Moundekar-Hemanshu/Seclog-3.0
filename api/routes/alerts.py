from fastapi import APIRouter
from api.services.bridge import fetch_alerts

router = APIRouter()

@router.get("/")
def get_alerts():
    return fetch_alerts()