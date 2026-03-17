from fastapi import APIRouter
from api.services.bridge import fetch_logs

router = APIRouter()

@router.get("/")
def get_logs():
    return fetch_logs()