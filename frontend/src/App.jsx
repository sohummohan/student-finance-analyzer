import { useState } from 'react'

function App() {
  const [ticker, setTicker] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyze() {
    if (!ticker.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/analyze/${ticker}`
      )

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({
        message: 'Could not connect to the backend.'
      })
    } finally {
      setLoading(false)
    }
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
      />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Company'}
      </button>

      {result && (
        <div>
          <p>
            <strong>{result.ticker}</strong>
          </p>
          <p>{result.message}</p>
        </div>
      )}
    </main>
  )
}

export default App