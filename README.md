
# BHSim Web

**Generate synthetic behavioral health datasets directly from your browser.**

BHSim Web is a free, open-source web application that generates fictional, relational behavioral health data for analytics development, software testing, education, and demonstrations.

**[Launch BHSim Web](https://bhsim-web.vercel.app/)**

## Overview

Healthcare analysts and developers often need realistic datasets to build and test applications without exposing sensitive patient information.

BHSim Web provides a browser-based interface for generating synthetic behavioral health datasets without installing Python or configuring an API key.

The application is powered by [BHSim](https://github.com/rahulbyrapuneni/bhsim), a Python synthetic data generation library.

## Features

- **Browser-based generation:** Configure and generate datasets online.
- **Relational data:** Generate linked behavioral health records.
- **SQLite downloads:** Download generated datasets as `.db` files.
- **Configurable datasets:** Choose clients, employees, history length, and random seed.
- **Reproducibility:** Use a fixed seed to reproduce generation settings.
- **Data validation:** Uses BHSim's built-in validation.
- **Rate limiting:** Restricts public generation attempts to manage shared infrastructure.
- **No API key required:** The web application handles backend authentication.

## How It Works

1. Visit https://bhsim-web.vercel.app/.
2. Configure the number of clients, employees, and months of historical data.
3. Optionally adjust the random seed.
4. Click **Generate dataset**.
5. Download the generated SQLite database.

Generated files are temporary. Download your database as soon as generation finishes.

## Dataset Configuration

| Parameter | Supported Values | Default |
|---|---|---|
| Clients | 1–500 | 100 |
| Employees | 1–100 | 20 |
| Historical data | 1–12 months | 12 |
| Random seed | Integer | 42 |

The current interface offers 1, 3, 6, and 12 months as history options.

## Architecture

```text
Browser (React + Vite)
        |
        v
Vercel Serverless API
        |
        +----> Neon PostgreSQL
        |      Public rate limiting
        |
        v
BHSim API (FastAPI / Render)
        |
        v
BHSim Python Library
        |
        v
Synthetic SQLite Database
        |
        v
Authenticated download through Vercel
        |
        v
Browser download
```

The browser communicates with Vercel serverless endpoints. Private backend credentials are not included in the client application.

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Web hosting | Vercel |
| Serverless endpoints | Node.js |
| Rate-limit database | Neon PostgreSQL |
| Dataset API | FastAPI on Render |
| Synthetic data engine | BHSim (Python) |
| Output | SQLite |

## Related Repositories

- **BHSim Python library:** https://github.com/rahulbyrapuneni/bhsim
- **BHSim API:** https://github.com/rahulbyrapuneni/bhsim-api
- **BHSim Web:** https://github.com/rahulbyrapuneni/bhsim-web

## Running Locally

### Requirements

- Node.js
- npm
- Access to a configured BHSim API
- PostgreSQL connection with the required rate-limit table

### Installation

Clone the repository:

```bash
git clone https://github.com/rahulbyrapuneni/bhsim-web.git
cd bhsim-web
npm install
```

Create a `.env.local` file with the following variables:

```dotenv
BHSIM_API_KEY=your_private_api_key
RATE_LIMIT_DATABASE_URL=your_postgresql_connection_url
RATE_LIMIT_SECRET=your_random_secret
```

These values are used exclusively by the server-side functions. Never commit `.env.local` to Git.

For local testing of the serverless endpoints, run:

```bash
npx vercel dev
```

The application is then available at the local URL shown by Vercel.

A standalone Vite development server does not replace the Vercel serverless backend.

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Check backend health |
| `/api/datasets` | POST | Generate a dataset |
| `/api/datasets/:datasetId/download` | GET | Download a generated SQLite database with a valid temporary token |

The generation endpoint forwards authorized requests to the BHSim API. The download endpoint verifies a time-limited token and streams the SQLite file.

## Usage Limits and Availability

The public website currently allows **two generation attempts per visitor IP address per UTC day**.

This is a basic abuse-prevention measure. Visitors sharing a public IP address may share a limit.

The backend also has its own shared API quota. Generation may be temporarily unavailable if that quota is reached or the hosting service is unavailable.

The application uses free-tier cloud infrastructure, so cold starts and temporary interruptions are possible.

Generated datasets are stored temporarily and can disappear following expiration, cleanup, or hosting restarts.

## Data Privacy and Limitations

BHSim generates **synthetic, fictional data**, not real patient records.

Generated records should not be treated as actual clinical evidence, validated population statistics, or representative research samples without additional evaluation.

The application is intended for development, testing, education, and demonstration purposes.

Do not submit real patient information or protected health information (PHI) through the dataset configuration interface.

## Project Status

**Version:** 1.0.0

BHSim Web has been deployed to Vercel, and production dataset generation and SQLite downloads have been successfully tested.

Additional testing, security review, and reliability improvements may be made in subsequent releases.

## Author

**Rahul Byrapuneni**

Creator and maintainer of the BHSim project ecosystem.

## Contributing

Issues, suggestions, bug reports, and pull requests are welcome.

Please avoid including real patient information, credentials, or sensitive production data in issues and contributions.
