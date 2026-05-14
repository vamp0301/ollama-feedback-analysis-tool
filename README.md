# Trinethra Supervisor Feedback Analyzer

## Overview

AI-powered transcript analysis tool for psychology interns using Ollama and Llama 3.2.

The application analyzes supervisor feedback transcripts and generates:

- Extracted evidence
- Rubric score
- KPI mapping
- Gap analysis
- Follow-up questions

## Tech Stack

Frontend:
- React
- Vite
- CSS

Backend:
- Node.js
- Express.js

AI:
- Ollama
- llama3.2

## Architecture

Frontend sends transcript to Express backend.
Backend sends prompt to locally running Ollama model.
The structured response is returned to frontend for review.

## Setup Instructions

### 1. Install Ollama

https://ollama.com

### 2. Pull model

```bash
ollama pull llama3.2