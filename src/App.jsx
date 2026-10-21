
import { useState } from "react";
import "./App.css";

function App() {
  // ---DATASET CONFIGURATION---
  const [clients, setClients] = useState(100);
  const [employees, setEmployees] = useState(20);
  const [historyMonths, setHistoryMonths] = useState(12);
  const [seed, setSeed] = useState(42);

  // ---GENERATION STATE---
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ---GENERATE DATASET---
  async function generateDataset() {
    setResult(null);
    setError("");

    const configuration = {
      clients: Number(clients),
      employees: Number(employees),
      history_months: Number(historyMonths),
      seed: Number(seed),
    };

    if (
      !Number.isInteger(configuration.clients) ||
      configuration.clients < 1 ||
      configuration.clients > 500 ||
      !Number.isInteger(configuration.employees) ||
      configuration.employees < 1 ||
      configuration.employees > 100 ||
      !Number.isInteger(configuration.history_months) ||
      configuration.history_months < 1 ||
      configuration.history_months > 12 ||
      !Number.isSafeInteger(configuration.seed)
    ) {
      setError("Please enter valid dataset settings.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuration),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "The daily generation limit has been reached. Please try again tomorrow."
          );
        }

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Dataset generation failed. Please try again."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">BHSim</div>
        <span className="version">Dataset Generator</span>
      </header>

      <main className="main">
        {/* ---HERO SECTION--- */}
        <div className="intro">
          <span className="eyebrow">BHSim / SYNTHETIC DATA PLATFORM</span>

          <h1>
            Behavioral health data.
            <span className="hero-accent"> Made simple.</span>
          </h1>

          <p>
            Generate realistic, fictional behavioral health datasets
            for analytics, testing, and research.
            No coding required.
          </p>
        </div>

        <section className="generator">
          <h2>Configure your dataset</h2>
          <p>
            Choose your dataset size and generate linked records
            in a SQLite database.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="clients">Clients</label>
              <input
                id="clients"
                type="number"
                min="1"
                max="500"
                value={clients}
                disabled={isGenerating}
                onChange={(e) => setClients(e.target.value)}
              />
              <small>Number of fictional individuals (1–500).</small>
            </div>

            <div className="form-field">
              <label htmlFor="employees">Employees</label>
              <input
                id="employees"
                type="number"
                min="1"
                max="100"
                value={employees}
                disabled={isGenerating}
                onChange={(e) => setEmployees(e.target.value)}
              />
              <small>Number of fictional employees (1–100).</small>
            </div>

            <div className="form-field">
              <label htmlFor="history">Historical data</label>
              <select
                id="history"
                value={historyMonths}
                disabled={isGenerating}
                onChange={(e) => setHistoryMonths(Number(e.target.value))}
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
              <small>How far back the generated records should go.</small>
            </div>

            <div className="form-field">
              <label htmlFor="seed">Random seed</label>
              <input
                id="seed"
                type="number"
                value={seed}
                disabled={isGenerating}
                onChange={(e) => setSeed(e.target.value)}
              />
              <small>Use the same seed to reproduce a dataset.</small>
            </div>
          </div>

          <button
            type="button"
            className="generate-button"
            onClick={generateDataset}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating dataset..." : "Generate dataset"}
          </button>

          {error && (
            <p role="alert" style={{ color: "#b42318", marginTop: "16px" }}>
              {error}
            </p>
          )}

          {result && (
            <div
              role="status"
              style={{
                marginTop: "20px",
                padding: "18px",
                border: "1px solid #d0e7da",
                borderRadius: "12px",
                background: "#f5fbf7",
              }}
            >
              <h3>Dataset generated successfully</h3>
              <p>
                <strong>Dataset ID:</strong> {result.dataset_id}
              </p>
              <p>
                <strong>Clients:</strong> {result.clients_requested}
              </p>
              <p>
                <strong>Employees:</strong> {result.employees_requested}
              </p>
              <p>
                <strong>Processing time:</strong>{" "}
                {result.performance?.total_processing_seconds ?? "N/A"} seconds
              </p>
              <p>
                <strong>Format:</strong> SQLite
              </p>
              <small>
                {result.download_token && (
                <a
                  className="generate-button"
                  href={`/api/datasets/${result.dataset_id}/download?token=${encodeURIComponent(result.download_token)}`}
                  download={`bhsim-${result.dataset_id}.db`}
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Download SQLite database
                </a>
              )}
              </small>
            </div>
          )}

          <p className="form-note">
            Limit: 2 generation attempts per visitor per UTC day.
            Generated files are temporary.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
