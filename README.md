# StockMerchUGS

_with React + TypeScript + Vite + Tailwind + Convex + TanStack Query + Clerk (for authentication)_

## Badges

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/80559360bc66475e92ee7d3df6803d31)](https://app.codacy.com/gh/plugveg/stock-merch-ugs/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/80559360bc66475e92ee7d3df6803d31)](https://app.codacy.com/gh/plugveg/stock-merch-ugs/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/plugveg/stock-merch-ugs/badge)](https://scorecard.dev/viewer/?uri=github.com/plugveg/stock-merch-ugs)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/10495/badge)](https://www.bestpractices.dev/projects/10495)

## Table of contents of the README

- [StockMerchUGS](#stockmerchugs)
  - [Things to know](#things-to-know)
  - [Diagram for the database](#diagram-for-the-database)
  - [How to run the project](#how-to-run-the-project)
  - [Track Progress](#track-progress)
  - [Roadmap](#roadmap)
  - [Roadmap Tech](#roadmap-tech)
  - [Tutorials](#tutorials)
    - [Importing Large Data Sets into Your Database](#importing-large-data-sets-into-your-database)
      - [Supported Data Formats](#supported-data-formats)
      - [Key Features](#key-features)
      - [Example Commands](#example-commands)
      - [Additional Resources](#additional-resources)

## Table of contents of the documentation

The folder `docs` contains the documentation for the project. The documentation is divided into several sections:

- **[Folder Deliverables](docs/deliverables)**: A folder containing the deliverables for the project.
  - [Cahier des charges](docs/deliverables/Cahier-des-charges_StockMerchUGS.pdf): A file containing the cahier des charges for the project.
  - [Livrable1](docs/deliverables/Livrable1.pdf): A file containing the first deliverable for the project (in french).
  - [Livrable2](docs/deliverables/Livrable2.pdf): A file containing the second deliverable for the project (in french).
  - [Livrable3](docs/deliverables/Livrable3.pdf): A file containing the third and final deliverable for the project (in french).
- **[Folder Database](docs/database)**: A folder with informations about the database.
  - [Database](docs/database/BDD_Stock-merch-UGS.pdf): A file containing the description of database schema for the project (in french).
  - [Database Diagram](docs/database/SchemaBDD-StockMerchUGS.png): A file containing the diagram of the database for the project. (see below for the updated diagram).
- **[Folder Maquettes](docs/maquettes)**: A folder containing the maquettes for the project.
  - [Maquette Analytics](docs/maquettes/Maquette-Analytics.png): A file containing the first maquette for the project related to the analytics about the products who have in your inventory.
  - [Maquette Display Settings](docs/maquettes/Maquette-Display-Settings.png): A file containing the second maquette for the project related to the setting-up for display settings.
  - [Maquette Inventory With Informations](docs/maquettes/Maquette-Inventory-with-info.png): A file containing the third maquette for the project related to the Inventory with all the informations about the products.
  - [Maquette Inventory](docs/maquettes/Maquette-Inventory.png): A file containing the fourth maquette for the project related to the basic Inventory.
  - [Maquette CRUD](docs/maquettes/Maquette-Modal-CRUD-Products.png): A file containing the fifth maquette for the project related to the CRUD.

## Things to know

- This project is a work in progress and is not yet complete.
- The project is being developed using [Convex](https://docs.convex.dev/) as the backend and [TanStack Query](https://tanstack.com/query/latest) for data fetching.
- The project is being developed using [Vite](https://vitejs.dev/) as the build tool and [React](https://reactjs.org/) as the frontend framework.
- The project is being developed using [TypeScript](https://www.typescriptlang.org/) as the programming language.
- The project is being developed using [Tailwind CSS](https://tailwindcss.com/) as the CSS framework.
- The project is being developed using [Vercel](https://vercel.com/) as the hosting platform.
- The project is being developed using [Clerk](https://clerk.com/) for authentication.

## Diagram for the database

![](https://app.eraser.io/workspace/do9LGbVDtteqDT7RNgEr/preview?elements=EvbIxxzfS2aiPggn8rcm-g&type=embed)

## How to run the project

### Prerequisites

Before you can run the project locally, you need to have the following software installed on your machine:

- Node.js (v18 or higher)
- npm (v8 or higher)
- Git (v2.0.0 or higher)

To run the project locally, you need to have [Node.js](https://nodejs.org/en/) installed on your machine. You can check if you have Node.js installed by running the following command in your terminal:

```bash
  node -v
```

You need to have also [npm](https://www.npmjs.com/) installed on your machine. You can check if you have npm installed by running the following command in your terminal:

```bash
  npm -v
```

If not, to install Node.js and npm, you can follow this link: [node & npm installation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Once you have Node.js & npm installed, you can run the project locally by following these steps:

1. Clone the repository using the command below:

```bash
  git clone https://github.com/plugveg/stock-merch-ugs.git
```

2. Navigate to the project directory:

```bash
  cd stock-merch-ugs
```

3. Install the dependencies using the command below:

```bash
  npm install
```

4. Create a `.env.local` file in the root directory of the project and add the following variables:

```bash
  # Convex for Development
  CONVEX_DEPLOYMENT=<your_convex_deployment>
  VITE_CONVEX_URL=<your_convex_url>
  CONVEX_SITE_URL=<your_convex_site_url>

  # Clerk for Development
  CLERK_WEBHOOK_SECRET=<your_clerk_webhook_secret> # Webhook secret for Clerk - DEV
  VITE_CLERK_FRONTEND_API_URL=<your_clerk_frontend_api_url> #API URL for the Clerk frontend - DEV
  VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key> # Publishable key for the Clerk frontend - DEV
  VITE_CLERK_SECRET_KEY=<your_clerk_secret_key> # Secret key for the Clerk frontend - DEV
```

5. Run the project using the command below:

```bash
  npm run dev
```

6. Open your browser and navigate to `http://localhost:5173` to see the project in action.
7. To run the tests, use the command below:

```bash
  npm run test
```

8. To run the linter, use the command below:

```bash
npm run lint
```

## Track Progress

This project is being developed in a [Jira](https://www.atlassian.com/software/jira) board. You can track the progress of the project by following the links below:

**[MasterProject EPIC](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-100)**

## Roadmap

- [x] Create a new Vite project with React + TypeScript : [SETSUMAFU-104](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-104)
- [x] Install all the dependencies for the front development : [SETSUMAFU-108](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-108)
- [x] Install all the dependencies for the backend development : [SETSUMAFU-109](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-109)
- [x] Install all the dependencies for test development + CI/CD + commitlint + husky + lint-staged : [SETSUMAFU-110](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-110)
- [x] Create a Convex project and deploy it to Convex : [SETSUMAFU-115](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-115)
- [x] Create a TanStack Query project and deploy it to Convex : [SETSUMAFU-114](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-114)
- [x] Synchronize the multiple environments across different OS and machines : [SETSUMAFU-113](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-113)
- [x] Update tailwind from v3 to v4 [SETSUMAFU-123](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-123)
- [x] Add OpenSSF Scorecard [SETSUMAFU-117](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-117)
- [x] Add documentation for the project & MCD [SETSUMAFU-131](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-131)
- [x] Add security policy [SETSUMAFU-124](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-124)
- [x] Create database in Convex [SETSUMAFU-135](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-135)
- [x] Create the authentication with Clerk [SETSUMAFU-138](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-138)

## Roadmap Tech

There aren't always a ticket for each tech steps.

- [x] Create all the CI/CD for checking the code quality and the code coverage
- [x] Add Dependabot for checking the dependencies
- [x] Add CodeQL for error detection and security vulnerabilities
- [x] Add Snyk for error detection and security vulnerabilities
- [x] Add OpenSSF Scorecard for error detection and security vulnerabilities
- [x] Integrated Codecov into the CI/CD pipeline to track code coverage (see badge at the top for current status)
- [x] Add a tutorial to launch the project locally [SETSUMAFU-139](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-139)
- [x] Update all dependencies to the latest version [SETSUMAFU-168](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-168)
- [x] Remove Codecov & add Codacy [SETSUMAFU-170](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-170)

## Tutorials

### Importing Large Data Sets into Your Database

If you need to import a large amount of data into your database, you can use the `npx convex import` command. This is particularly useful if you have an array of JSON objects or other supported formats that you would otherwise manually input via the dashboard.

#### Supported Data Formats

The `npx convex import` command supports the following data formats:

- **CSV**: Comma-separated values file.
- **JSON Array**: A file containing an array of JSON objects.
- **JSONL**: A file with one JSON object per line.
- **ZIP**: A zip file in the format generated by `npx convex export`.

#### Key Features

1. **Multiple Tables**: If you use a zip file, the command can import data into multiple tables at once.
2. **Replace or Append**: Use the `--replace` or `--append` flags to specify whether to overwrite existing data or add to it.
3. **Production Database**: To import data into the production database, you must include the `--prod` flag.
4. **Preserve References**: When re-importing data exported with `npx convex export`, ID references and creation timestamps are preserved.

#### Example Commands

To import data into your database, use the following commands:

- **Export Data**: Capture a snapshot of your current database.

  ```bash
  npx convex export --path <~/path/to/store>
  ```

- **Import Data**: Import the data into your database.

  ```bash
  npx convex import --path <~/path/to/store>
  ```

- **Replace Existing Data**: Overwrite the data in the target table.

  ```bash
  npx convex import --path <~/path/to/store> --replace
  ```

- **Append to Existing Data**: Add new data without overwriting.

  ```bash
  npx convex import --path <~/path/to/store> --append
  ```

- **Import into Production**: Ensure you include the `--prod` flag for production databases.
  ```bash
  npx convex import --path <~/path/to/store> --prod
  ```

#### Additional Resources

For more details on exporting and importing data, refer to the official Convex documentation:

- [Export Command Details](https://docs.convex.dev/database/import-export/export)
- [Import Command Details](https://docs.convex.dev/database/import-export/import)
