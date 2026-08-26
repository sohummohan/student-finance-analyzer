from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yfinance as yf

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
    symbol = ticker.strip().upper()

    if not symbol:
        return JSONResponse(
            status_code=400,
            content={
                "ticker": ticker,
                "error": "invalid_ticker",
                "message": "Please enter a ticker symbol.",
            },
        )

    try:
        info = yf.Ticker(symbol).info
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "ticker": symbol,
                "error": "upstream_unavailable",
                "message": "The financial data source is unavailable right now. Please try again.",
            },
        )

    # yfinance doesn't raise for an unknown ticker: it returns a near-empty
    # info dict with no company identity fields.
    if not info or (info.get("longName") is None and info.get("shortName") is None):
        return JSONResponse(
            status_code=404,
            content={
                "ticker": symbol,
                "error": "not_found",
                "message": f"We couldn't find data for '{symbol}'. Check the ticker and try again.",
            },
        )

    revenue = info.get("totalRevenue")
    net_income = info.get("netIncomeToCommon")
    market_cap = info.get("marketCap")
    enterprise_value = info.get("enterpriseValue")
    ebitda = info.get("ebitda")

    profit_margin = info.get("profitMargins")
    if profit_margin is None and net_income is not None and revenue:
        profit_margin = net_income / revenue

    ps_ratio = info.get("priceToSalesTrailing12Months")
    if ps_ratio is None and market_cap is not None and revenue:
        ps_ratio = market_cap / revenue

    ev_ebitda = info.get("enterpriseToEbitda")
    if ev_ebitda is None and enterprise_value is not None and ebitda:
        ev_ebitda = enterprise_value / ebitda

    pe_ratio = info.get("trailingPE")
    if pe_ratio is None:
        pe_ratio = info.get("forwardPE")

    return {
        "ticker": symbol,
        "company_name": info.get("longName") or info.get("shortName"),
        "currency": info.get("currency"),
        "metrics": {
            "revenue": revenue,
            "net_income": net_income,
            "cash": info.get("totalCash"),
            "debt": info.get("totalDebt"),
            "free_cash_flow": info.get("freeCashflow"),
            "revenue_growth": info.get("revenueGrowth"),
            "profit_margin": profit_margin,
        },
        "valuation": {
            "pe_ratio": pe_ratio,
            "ps_ratio": ps_ratio,
            "ev_ebitda": ev_ebitda,
        },
    }
