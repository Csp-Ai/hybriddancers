# Contributing to Hybrid Dancers

Thank you for helping improve the Hybrid Dancers website! This project mixes a small Node.js server with static HTML, CSS and JavaScript. Automated tests live in the `tests/` folder and run with **pytest**.

## Project Setup

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Install Python test dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update the values for your local environment.

## Development Workflow

1. Create a feature branch from `main`.
2. Make your changes and add tests when appropriate.
3. Run the test suite:
   ```bash
   pytest
   ```
4. Commit using a clear message in the present tense.
5. Open a pull request targeting `main`.

## Code Standards

- JavaScript and HTML use **2 spaces** for indentation.
- Keep functions small and well commented.
- Use environment variables for secrets; never hard‑code API keys.
- Ensure `pytest` passes before submitting.
 
## Local Debug Logs

During development you may want to capture verbose logs. Redirect output to a file ending in `-debug.log`, which is ignored by Git:

```bash
node server.js > server-debug.log 2>&1
```

Agent scripts write to `data/logs.json` for traceability. If you generate logs locally, restore that file before committing so log data isn't checked in:

```bash
git restore data/logs.json
```

We appreciate all issues and pull requests. Happy coding!
