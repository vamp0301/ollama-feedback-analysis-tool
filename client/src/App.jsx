import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')

  const runAnalysis = async () => {
    if (!transcript.trim()) return

    try {
      setLoading(true)
      setError('')
      setAnalysis(null)

      const response = await axios.post(
        'http://localhost:3012/api/analyze',
        { transcript },
        { timeout: 130000 }
      )

      setAnalysis(response.data)
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Unknown error'

      setError(
        'Failed to analyze transcript: ' + detail
      )

      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sentimentColor = (s) => {
    if (s === 'positive') {
      return {
        bg: '#dcfce7',
        text: '#166534',
        label: 'Positive',
      }
    }

    if (s === 'negative') {
      return {
        bg: '#fee2e2',
        text: '#991b1b',
        label: 'Negative',
      }
    }

    return {
      bg: '#fef9c3',
      text: '#854d0e',
      label: 'Neutral',
    }
  }

  const scoreClass =
    analysis?.rubricScore?.score >= 7
      ? 'score-good'
      : analysis?.rubricScore?.score >= 4
      ? 'score-medium'
      : 'score-low'

  return (
    <div className="app">
      {/* Header */}
      <h1 className="title">
        Trinethra — Supervisor Feedback Analyzer
      </h1>

      <p className="subtitle">
        AI-assisted transcript evaluation for psychology interns
      </p>

      <div className="warning-box">
        ⚠ AI Suggested Analysis — Human Review
        Required. Accept, edit, or reject each
        finding.
      </div>

      {/* Main Layout */}
      <div className="layout">
        {/* LEFT PANEL */}
        <div className="card">
          <h2 className="heading">
            Transcript Input
          </h2>

          <textarea
            className="textarea"
            placeholder="Paste the supervisor transcript here..."
            value={transcript}
            onChange={(e) =>
              setTranscript(e.target.value)
            }
          />

          <button
            className="button"
            onClick={runAnalysis}
            disabled={loading || !transcript.trim()}
          >
            {loading
              ? 'Analyzing… this may take 30–60 seconds'
              : 'Run Analysis'}
          </button>

          {error && (
            <p className="error">{error}</p>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="output-panel">
          {!analysis && !loading && (
            <div className="card empty-state">
              Paste a transcript and click Run
              Analysis to see results here.
            </div>
          )}

          {loading && (
            <div className="card loading-state">
              <div
                style={{
                  fontSize: '32px',
                  marginBottom: '12px',
                }}
              >
                ⏳
              </div>

              <p
                style={{
                  fontWeight: '500',
                }}
              >
                Running analysis…
              </p>

              <p
                style={{
                  fontSize: '13px',
                  marginTop: '6px',
                }}
              >
                Ollama is processing the transcript.
                This usually takes 30–90 seconds.
              </p>
            </div>
          )}

          {analysis && (
            <>
              {/* Rubric Score */}
              <div className="card">
                <h2 className="heading">
                  Rubric Score
                </h2>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    className={`score ${scoreClass}`}
                  >
                    {analysis.rubricScore.score}
                    <span
                      style={{
                        fontSize: '24px',
                        color: '#9ca3af',
                      }}
                    >
                      /10
                    </span>
                  </div>

                  <div
                    className="badge"
                    style={{
                      background:
                        analysis.rubricScore.score >= 7
                          ? '#dcfce7'
                          : analysis.rubricScore
                                .score >= 4
                          ? '#fef3c7'
                          : '#fee2e2',

                      color:
                        analysis.rubricScore.score >= 7
                          ? '#166534'
                          : analysis.rubricScore
                                .score >= 4
                          ? '#92400e'
                          : '#991b1b',
                    }}
                  >
                    {analysis.rubricScore.score >= 7
                      ? 'Strong'
                      : analysis.rubricScore.score >=
                        4
                      ? 'Moderate'
                      : 'Needs Improvement'}
                  </div>
                </div>

                <p
                  style={{
                    color: '#374151',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                >
                  {
                    analysis.rubricScore
                      .justification
                  }
                </p>
              </div>

              {/* Evidence */}
              <div className="card">
                <h2 className="heading">
                  Extracted Evidence
                </h2>

                {analysis.evidence.map(
                  (item, index) => {
                    const c = sentimentColor(
                      item.sentiment
                    )

                    return (
                      <div
                        key={index}
                        className="evidence-item"
                      >
                        <p className="quote">
                          "{item.quote}"
                        </p>

                        <span
                          className="sentiment"
                          style={{
                            background: c.bg,
                            color: c.text,
                          }}
                        >
                          {c.label}
                        </span>

                        <p className="reason">
                          {item.reason}
                        </p>
                      </div>
                    )
                  }
                )}
              </div>

              {/* KPI Mapping */}
              <div className="card">
                <h2 className="heading">
                  KPI Mapping
                </h2>

                {analysis.kpiMapping.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="kpi-item"
                    >
                      <p
                        style={{
                          fontWeight: '600',
                          marginBottom: '4px',
                        }}
                      >
                        {item.kpi}
                      </p>

                      <p
                        style={{
                          fontSize: '13px',
                          color: '#6b7280',
                        }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Gap Analysis */}
              <div className="card">
                <h2 className="heading">
                  Gap Analysis
                </h2>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '10px',
                  }}
                >
                  Areas not discussed in the
                  transcript:
                </p>

                <ul className="list">
                  {analysis.gapAnalysis.map(
                    (gap, index) => (
                      <li key={index}>{gap}</li>
                    )
                  )}
                </ul>
              </div>

              {/* Follow-up Questions */}
              <div className="card">
                <h2 className="heading">
                  Suggested Follow-up Questions
                </h2>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '10px',
                  }}
                >
                  Questions for the next supervisor
                  call:
                </p>

                <ol className="list">
                  {analysis.followUpQuestions.map(
                    (q, index) => (
                      <li key={index}>{q}</li>
                    )
                  )}
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App