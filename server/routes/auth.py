from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta

import jwt

router = APIRouter()

SECRET_KEY = "seclog-secret-key"

ALGORITHM = "HS256"

FAKE_USER = {

    "username": "admin@seclog.com",

    "password": "admin123"
}


@router.post("/login")
def login(data: dict):

    username = data.get("username")

    password = data.get("password")

    if (

        username != FAKE_USER["username"]

        or password != FAKE_USER["password"]

    ):

        raise HTTPException(

            status_code=401,

            detail="Invalid credentials"
        )

    token = jwt.encode(

        {

            "sub": username,

            "exp": datetime.utcnow() + timedelta(hours=12)

        },

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return {

        "token": token
    }