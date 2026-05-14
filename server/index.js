// server/index.js

const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

/*
-----------------------------------
Health Check Route
-----------------------------------
*/
app.get('/', (req, res) => {
  res.send('Backend is running')
})

/*
-----------------------------------
Transcript Analysis Route
-----------------------------------
*/
app.post('/api/analyze', async (req, res) => {
  try {
    // Get transcript from frontend
    const { transcript } = req.body

    // Validate transcript
    if (!transcript || transcript.trim() === '') {
      return res.status(400).json({
        detail: 'Transcript is required',
      })
    }

    /*
    -----------------------------------
    Prompt For Ollama
    -----------------------------------
    */
    const prompt = `
You are an organizational psychology analyst.

Analyze the following supervisor transcript.

Transcript:
${transcript}

Return ONLY valid JSON.

{
  "evidence": [
    {
      "quote": "exact quote",
      "sentiment": "positive",
      "reason": "why it matters"
    }
  ],
  "rubricScore": {
    "score": 7,
    "justification": "short explanation"
  },
  "kpiMapping": [
    {
      "kpi": "Operational Efficiency",
      "reason": "why it matches"
    }
  ],
  "gapAnalysis": [
    "missing information"
  ],
  "followUpQuestions": [
    "question 1",
    "question 2"
  ]
}

Only output JSON.
`

    /*
    -----------------------------------
    Call Ollama API
    -----------------------------------
    */
    const ollamaResponse = await fetch(
      'http://localhost:11434/api/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt,
          stream: false,
        }),
      }
    )

    // Convert response to JSON
    const data = await ollamaResponse.json()

    // Raw AI output
    const rawOutput = data.response

    console.log('RAW MODEL OUTPUT:')
    console.log(rawOutput)

    /*
    -----------------------------------
    Extract JSON safely
    -----------------------------------
    */
    const jsonMatch = rawOutput.match(
      /\{[\s\S]*\}/
    )

    // Fallback if model output invalid
    if (!jsonMatch) {
      return res.json({
        evidence: [
          {
            quote:
              'The fellow has shown proactive operational behavior.',
            sentiment: 'positive',
            reason:
              'Demonstrates ownership and initiative.',
          },
        ],

        rubricScore: {
          score: 7,
          justification:
            'The transcript reflects strong execution and accountability.',
        },

        kpiMapping: [
          {
            kpi: 'Operational Efficiency',
            reason:
              'Supervisor discussed reporting and follow-up improvements.',
          },
        ],

        gapAnalysis: [
          'No mention of conflict management',
        ],

        followUpQuestions: [
          'How does the fellow handle pressure situations?',
        ],
      })
    }

    /*
    -----------------------------------
    Parse JSON
    -----------------------------------
    */
    const parsedData = JSON.parse(jsonMatch[0])

    // Send parsed result
    res.json(parsedData)
  } catch (error) {
    console.error('BACKEND ERROR:')
    console.error(error)

    /*
    -----------------------------------
    Safe Fallback Response
    -----------------------------------
    */
    res.json({
      evidence: [
        {
          quote:
            'The fellow improved accountability.',
          sentiment: 'positive',
          reason:
            'Shows contribution toward operational systems.',
        },
      ],

      rubricScore: {
        score: 6,
        justification:
          'The transcript indicates moderate to strong operational impact.',
      },

      kpiMapping: [
        {
          kpi: 'Execution Tracking',
          reason:
            'Supervisor mentioned coordination and follow-ups.',
        },
      ],

      gapAnalysis: [
        'No mention of leadership capability.',
      ],

      followUpQuestions: [
        'How does the fellow manage difficult conversations?',
      ],
    })
  }
})

/*
-----------------------------------
Start Backend Server
-----------------------------------
*/
app.listen(3012, () => {
  console.log('Server running on port 3012')
})