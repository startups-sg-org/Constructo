from datetime import UTC, datetime

from fastapi import FastAPI

app = FastAPI()
counter = 0

@app.get("/")
def home():
    return{
        "message" : "helo World",
        "now": datetime.now(tz=UTC).isoformat(),
        "counter": 3,
    }
    