from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Student Finance Analyzer backend is running!"}


@app.get("/api/analyze/{ticker}")
def analyze_company(ticker: str):
    return {
        "ticker": ticker.upper(),
        "message": f"Backend received {ticker.upper()} successfully!"
    }