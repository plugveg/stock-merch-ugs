# StockMerchUGS

_with React + TypeScript + Vite + Tailwind + Convex + TanStack Query_

## Things to know

- This project is a work in progress and is not yet complete.
- The project is being developed using [Convex](https://docs.convex.dev/) as the backend and [TanStack Query](https://tanstack.com/query/latest) for data fetching.
- The project is being developed using [Vite](https://vitejs.dev/) as the build tool and [React](https://reactjs.org/) as the frontend framework.
- The project is being developed using [TypeScript](https://www.typescriptlang.org/) as the programming language.
- The project is being developed using [Tailwind CSS](https://tailwindcss.com/) as the CSS framework.
- The project is being developed using [Vercel](https://vercel.com/) as the hosting platform.

## Deploying From Your Terminal

You can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):

```shell
$ vercel
```

## Track Progress

This project is being developed in a [Jira](https://www.atlassian.com/software/jira) board. You can track the progress of the project by following the links below:

**[MasterProject EPIC](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-100)**

## Roadmap

- [x] Step 0 : Create a new Vite project with React + TypeScript : [SETSUMAFU-104](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-104)
- [x] Step 1 : Install all the dependencies for the front development : [SETSUMAFU-108](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-108)
- [x] Step 2 : Install all the dependencies for the backend development : [SETSUMAFU-109](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-109)
- [x] Step 3 : Install all the dependencies for test development + CI/CD + commitlint + husky + lint-staged : [SETSUMAFU-110](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-110)
- [x] Step 4 : Create a Convex project and deploy it to Convex : [SETSUMAFU-115](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-115)
- [x] Step 5 : Create a TanStack Query project and deploy it to Convex : [SETSUMAFU-114](https://setsumafuyu.atlassian.net/browse/SETSUMAFU-114)

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
