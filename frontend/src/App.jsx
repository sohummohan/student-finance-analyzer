import { useState } from 'react'
import './App.css'

function formatCurrency(value, currency) {
  if (value === null || value === undefined) return 'N/A'

  const abs = Math.abs(value)
  let scaled = value
  let suffix = ''

  if (abs >= 1e12) {
    scaled = value / 1e12
    suffix = 'T'
  } else if (abs >= 1e9) {
    scaled = value / 1e9
    suffix = 'B'
  } else if (abs >= 1e6) {
    scaled = value / 1e6
    suffix = 'M'
  }

  const symbol = currency === 'USD' || !currency ? '$' : `${currency} `
  return `${symbol}${scaled.toFixed(2)}${suffix}`
}

function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A'
  return `${(value * 100).toFixed(2)}%`
}

function formatRatio(value) {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(2)}x`
}

function MetricRow({ label, value }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

function App() {
  const [ticker, setTicker] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyze() {
    if (!ticker.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/analyze/${encodeURIComponent(ticker.trim())}`
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
      } else {
        setResult(data)
      }
    } catch (err) {
      console.error(err)
      setError('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') handleAnalyze()
  }

  return (
    <main>
      <h1>Student Finance Analyzer</h1>

      <p>
        Learn how to understand company financials without needing
        a background in finance.
      </p>

      <input
        type="text"
        placeholder="Enter a company ticker (e.g. AAPL)"
        value={ticker}
        onChange={(event) => setTicker(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Company'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="results">
          <h2>
            {result.company_name} ({result.ticker})
          </h2>

          <section className="metrics-card">
            <h3>Financial Overview</h3>
            <MetricRow
              label="Revenue"
              value={formatCurrency(result.metrics.revenue, result.currency)}
            />
            <MetricRow
              label="Net Income"
              value={formatCurrency(result.metrics.net_income, result.currency)}
            />
            <MetricRow
              label="Cash"
              value={formatCurrency(result.metrics.cash, result.currency)}
            />
            <MetricRow
              label="Debt"
              value={formatCurrency(result.metrics.debt, result.currency)}
            />
            <MetricRow
              label="Free Cash Flow"
              value={formatCurrency(result.metrics.free_cash_flow, result.currency)}
            />
            <MetricRow
              label="Revenue Growth"
              value={formatPercent(result.metrics.revenue_growth)}
            />
            <MetricRow
              label="Profit Margin"
              value={formatPercent(result.metrics.profit_margin)}
            />
          </section>

          <section className="metrics-card">
            <h3>Valuation</h3>
            <MetricRow label="P/E Ratio" value={formatRatio(result.valuation.pe_ratio)} />
            <MetricRow label="P/S Ratio" value={formatRatio(result.valuation.ps_ratio)} />
            <MetricRow
              label="EV/EBITDA"
              value={formatRatio(result.valuation.ev_ebitda)}
            />
          </section>
        </div>
      )}
    </main>
  )
}

export default App
