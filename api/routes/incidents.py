from fastapi import APIRouter
from api.services.bridge import fetch_incidents

router = APIRouter()

@router.get("/")
def get_incidents():
    return fetch_incidents()