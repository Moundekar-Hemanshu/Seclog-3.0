from fastapi import FastAPI
from server.api.routes import router
from server.database.db import engine
from server.models.schemas import Base
from fastapi.middleware.cors import CORSMiddleware
from server.routes.auth import router as auth_router

app = FastAPI(title="SecLog Central Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "SecLog Server Running"}

Base.metadata.create_all(bind=engine)