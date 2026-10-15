
import { useState } from "react";
import "./App.css";

function App() {
  // ---DATASET CONFIGURATION---
  const [clients, setClients] = useState(100);
  const [employees, setEmployees] = useState(20);
  const [historyMonths, setHistoryMonths] = useState(12);
  const [seed, setSeed] = useState(42);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">BHSim</div>
        <span className="version">Dataset Generator</span>
      </header>

      <main className="main">
        <div className="intro">
          <span className="eyebrow">SYNTHETIC DATA PLATFORM</span>
          <h1>Behavioral health data, ready to explore.</h1>
          <p>
            Generate realistic, fictional behavioral health datasets
            for analytics, software testing, and research.
          </p>
        </div>

        <section className="generator">
          <h2>Configure your dataset</h2>
          <p>
            Choose your dataset size and generate linked records
            in a downloadable SQLite database.
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
                onChange={(e) => setEmployees(e.target.value)}
              />
              <small>Number of fictional employees (1–100).</small>
            </div>

            <div className="form-field">
              <label htmlFor="history">Historical data</label>
              <select
                id="history"
                value={historyMonths}
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
                onChange={(e) => setSeed(e.target.value)}
              />
              <small>Use the same seed to reproduce a dataset.</small>
            </div>
          </div>

          <button
            type="button"
            className="generate-button"
            onClick={() =>
              window.alert(
                `Dataset configuration:\n${clients} clients\n${employees} employees\n${historyMonths} months\nSeed: ${seed}`
              )
            }
          >
            Preview configuration
          </button>

          <p className="form-note">
            Preview only. Dataset generation will be connected to the API next.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
