
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

    // ---VALIDATE CONFIGURATION---
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
      // ---CALL VERCEL API PROXY---
      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuration),
      });

      const data = await response.json();

      // ---HANDLE API ERRORS---
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

      // ---SAVE GENERATION RESULT---
      setResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="app">

      {/* ---HEADER--- */}
      <header className="header">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span className="brand-name">BHSim</span>
          <span className="brand-divider" />
          <span className="brand-subtitle">
            Dataset Generator
          </span>
        </div>

        <a
          className="header-link"
          href="https://github.com/rahulbyrapuneni/bhsim"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub ↗
        </a>
      </header>

      {/* ---MAIN CONTENT--- */}
      <main className="main">

        {/* ---HERO SECTION--- */}
        <section className="intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            BHSIM / SYNTHETIC DATA PLATFORM
          </div>

          <h1>
            Behavioral health data.
            <span className="headline-accent">
              {" "}Made simple.
            </span>
          </h1>

          <p>
            Generate realistic, fictional behavioral health
            datasets for analytics, testing, and research.
            No coding required.
          </p>

          <div className="intro-tags">
            <span>Synthetic data</span>
            <span>SQLite + CSV</span>
            <span>No patient information</span>
          </div>
        </section>

        {/* ---DATASET GENERATOR--- */}
        <section className="generator">

          {/* ---GENERATOR HEADING--- */}
          <div className="generator-heading">
            <div>
              <span className="section-label">
                DATASET CONFIGURATION
              </span>

              <h2>Configure your dataset</h2>

              <p>
                Choose your dataset size and generate
                realistic, interconnected behavioral
                health records. Download your dataset
                as SQLite or CSV files.
              </p>
            </div>

            <span className="format-pill">
              SQLite + CSV
            </span>
          </div>

          {/* ---CONFIGURATION FORM--- */}
          <div className="form-grid">

            {/* ---CLIENTS--- */}
            <div className="form-field">
              <label htmlFor="clients">
                Clients
              </label>

              <input
                id="clients"
                type="number"
                min="1"
                max="500"
                value={clients}
                disabled={isGenerating}
                onChange={(e) =>
                  setClients(e.target.value)
                }
              />

              <small>
                Number of fictional individuals (1–500).
              </small>
            </div>

            {/* ---EMPLOYEES--- */}
            <div className="form-field">
              <label htmlFor="employees">
                Employees
              </label>

              <input
                id="employees"
                type="number"
                min="1"
                max="100"
                value={employees}
                disabled={isGenerating}
                onChange={(e) =>
                  setEmployees(e.target.value)
                }
              />

              <small>
                Number of fictional employees (1–100).
              </small>
            </div>

            {/* ---HISTORICAL DATA--- */}
            <div className="form-field">
              <label htmlFor="history">
                Historical data
              </label>

              <select
                id="history"
                value={historyMonths}
                disabled={isGenerating}
                onChange={(e) =>
                  setHistoryMonths(Number(e.target.value))
                }
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>

              <small>
                How far back generated records should go.
              </small>
            </div>

            {/* ---RANDOM SEED--- */}
            <div className="form-field">
              <label htmlFor="seed">
                Random seed
              </label>

              <input
                id="seed"
                type="number"
                value={seed}
                disabled={isGenerating}
                onChange={(e) =>
                  setSeed(e.target.value)
                }
              />

              <small>
                Use the same seed to reproduce a dataset.
              </small>
            </div>
          </div>

          {/* ---GENERATE BUTTON--- */}
          <button
            type="button"
            className="generate-button"
            onClick={generateDataset}
            disabled={isGenerating}
          >
            {isGenerating && (
              <span className="button-spinner" />
            )}

            {isGenerating
              ? "Generating dataset..."
              : "Generate dataset"}
          </button>

          {/* ---ERROR MESSAGE--- */}
          {error && (
            <div className="error-card" role="alert">
              <strong>Unable to generate dataset</strong>
              <p>{error}</p>
            </div>
          )}

          {/* ---GENERATION SUCCESS--- */}
          {result && (
            <div className="result-card" role="status">

              {/* ---SUCCESS HEADING--- */}
              <div className="result-heading">
                <div className="success-icon">
                  ✓
                </div>

                <div>
                  <h3>
                    Dataset generated successfully
                  </h3>

                  <p>
                    Your synthetic behavioral health
                    dataset is ready to download.
                  </p>
                </div>
              </div>

              {/* ---DATASET STATISTICS--- */}
              <div className="result-stats">

                <div>
                  <span>CLIENTS</span>
                  <strong>
                    {result.clients_requested}
                  </strong>
                </div>

                <div>
                  <span>EMPLOYEES</span>
                  <strong>
                    {result.employees_requested}
                  </strong>
                </div>

                <div>
                  <span>PROCESSING TIME</span>
                  <strong>
                    {result.performance
                      ?.total_processing_seconds ?? "N/A"}
                    s
                  </strong>
                </div>
              </div>

              {/* ---DATASET ID--- */}
              <p className="dataset-id">
                Dataset ID:{" "}
                <code>{result.dataset_id}</code>
              </p>

              {/* ---DOWNLOAD OPTIONS--- */}
              {result.download_token && (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >

                    {/* ---SQLITE DOWNLOAD--- */}
                    <a
                      className="download-button"
                      href={`/api/datasets/${
                        result.dataset_id
                      }/download?token=${encodeURIComponent(
                        result.download_token
                      )}&format=sqlite`}
                      download={`bhsim-${result.dataset_id}.db`}
                    >
                      Download SQLite (.db)
                    </a>

                    {/* ---CSV DOWNLOAD--- */}
                    <a
                      className="download-button"
                      href={`/api/datasets/${
                        result.dataset_id
                      }/download?token=${encodeURIComponent(
                        result.download_token
                      )}&format=csv`}
                      download={`bhsim-${result.dataset_id}-csv.zip`}
                    >
                      Download CSV (.zip)
                    </a>
                  </div>

                  <p className="result-note">
                    Both formats contain the same
                    dataset. CSV files are packaged
                    in a ZIP archive.
                  </p>
                </>
              )}

            </div>
          )}

          {/* ---GENERATION LIMIT NOTICE--- */}
          <p className="form-note">
            Limit: 2 generation attempts per visitor
            per UTC day. Generated files are temporary.
          </p>

        </section>

        {/* ---HOW IT WORKS--- */}
        <section className="how-it-works">
          <span className="section-label">
            SIMPLE BY DESIGN
          </span>

          <h2>How BHSim works</h2>

          <div className="steps-grid">

            <div className="step">
              <span className="step-number">01</span>
              <h3>Configure</h3>
              <p>
                Choose how many clients and employees
                you need, along with the historical
                period.
              </p>
            </div>

            <div className="step">
              <span className="step-number">02</span>
              <h3>Generate</h3>
              <p>
                BHSim creates interconnected synthetic
                behavioral health records for your dataset.
              </p>
            </div>

            <div className="step">
              <span className="step-number">03</span>
              <h3>Download</h3>
              <p>
                Export your dataset as a SQLite database
                or CSV files for analysis and testing.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* ---FOOTER--- */}
      <footer className="footer">
        <span>
          © {new Date().getFullYear()} BHSim.
          Created by Rahul Byrapuneni.
        </span>

        <div className="footer-links">
          <a
            href="https://github.com/rahulbyrapuneni/bhsim"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://pypi.org/project/bhsim/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Python package
          </a>
        </div>
      </footer>

    </div>
  );
}

export default App;
