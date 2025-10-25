from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, datasets

app = FastAPI()

origins = [
    "http://localhost:5173",
    # add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],            # Allow all HTTP methods
    allow_headers=["*"],            # Allow all headers including Authorization
)

app.include_router(auth.router)
app.include_router(datasets.router)

@app.get("/")
async def root():
    return {"message": "API is running"}
