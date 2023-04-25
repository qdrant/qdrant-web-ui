# Qdrant Web UI

**WORK IN PROGRESS**

This is a self-hosted web UI for the [Qdrant](https://github.com/qdrant/qdrant) Vector Search Engine. The primary purpose of this UI is to provide an easy way to view and manage your collections. The interface is similar to [Kibana](https://www.elastic.co/kibana) for Elasticsearch, but it does not require any additional services.

## Benefits of using TypeScript in a React application with Vite

TypeScript is a statically typed language that extends JavaScript by adding type annotations to variables, functions, and other elements in the code. Using TypeScript in a React application with Vite provides several benefits, including:

- Catching Errors Early: TypeScript allows catching errors at compile-time, which helps to identify and fix errors early in the development process. This reduces the number of bugs and improves the overall stability of the application.

- Enhanced Code Quality: TypeScript provides features such as interfaces, classes, and strict type checking that can improve the quality of the code by making it more readable, maintainable, and easier to refactor.

- Improved Collaboration: TypeScript can make collaborating on codebases easier, as it provides more clarity on what types of data are being passed around the codebase, and how they should be handled.

- Better Editor Support: TypeScript integrates with most modern code editors, providing features like autocompletion, code highlighting, and navigation that can improve productivity.

When used with Vite, TypeScript can also benefit from Vite's fast build and hot-reloading capabilities, allowing developers to iterate more quickly and efficiently.

## Why use Vite instead of Create React App

Create React App (CRA) is a popular tool for bootstrapping React applications. However, Vite is a newer tool that provides several advantages over CRA, including:

- Faster Build Times: Vite uses an innovative development server that allows for near-instantaneous hot module replacement (HMR) and faster builds. This can save developers a significant amount of time and improve their workflow.

- Simpler Configuration: Vite requires minimal configuration out-of-the-box, making it easier to set up and customize than CRA.

- Better Integration with Other Tools: Vite integrates seamlessly with other modern tools, such as TypeScript, Preact, and Vue, allowing for a more flexible development experience.

- Modular Architecture: Vite's modular architecture allows developers to easily swap out and add features as needed, providing more control over the build process.

Overall, Vite provides a faster, more flexible, and more modern development experience than Create React App, making it a compelling choice for React developers.

## Stack

- React Query: React Query is a library for fetching and caching data in a React application. It provides a simple API for handling data fetching and caching, with built-in support for pagination, caching, and other features.

- Zod: Zod is a TypeScript-first schema validation library that provides a simple, composable, and flexible way to validate data in JavaScript applications. It can help improve the quality of the code by providing type-safe validation and preventing runtime errors.

- Axios: Axios is a popular JavaScript library for making HTTP requests in a browser or Node.js environment. It provides an easy-to-use API for handling requests, with support for features such as interceptors, request cancellation, and more.

- Vite: As discussed earlier, Vite is a fast build tool for modern web development that provides features such as HMR and fast builds. It integrates seamlessly with TypeScript and React, making it an ideal choice for building a React application with TypeScript.

## App Features

- Console page for creating queries to the Qdrant endpoint
- Collections tab for displaying all data in your vector database
- Key binding [Ctrl + Enter] to trigger the selected query

## Getting Started

Follow these steps to clone the project, configure the environment, install dependencies, and run the project:

1. Clone the project:

```shell
git clone https://github.com/your-repository/qdrant-web-ui.git
cd qdrant-web-ui
```

2. Configure the environment variables:

Copy the `.env.local.example` file to `.env.local` and update the variables as needed:

```shell
cp .env.local.example .env.local
```

Edit the `.env.local` file to set the appropriate values for your environment.

3. Install pnpm:

```shell
npm install -g pnpm
```

### What is pnpm?

pnpm is a fast, disk-efficient package manager for Node.js. It is an alternative to npm and Yarn, offering a unique way of handling dependencies. pnpm creates a content-addressable storage system, allowing it to share dependencies between different projects, saving disk space and speeding up installations.

[https://pnpm.io/](https://pnpm.io/)

### Why use pnpm over npm and Yarn?

- **Faster installations:** pnpm is often faster than npm and Yarn because it reuses previously downloaded packages.
- **Disk space efficiency:** pnpm shares dependencies between projects, reducing the amount of disk space required for node_modules.
- **Strict package linking:** pnpm uses symlinks to create a node_modules structure, ensuring that your project only has access to the dependencies it explicitly lists.

4. Install dependencies:

```shell
pnpm install
```

5. Run the project:

```shell
pnpm run dev

```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Available Scripts

In the project directory, you can run:

### `pnpm run dev`

Runs the app in the development mode. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

Development mode expects that Qdrant is running on [http://localhost:6333](http://localhost:6333).

### `pnpm run build`

Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes. Your app is ready to be deployed!

### `pnpm run lint`

Runs ESLint on the `src` folder to check for code quality and style issues.

### `pnpm run preview`

Serves the production build for previewing purposes using Vite.

### `pnpm test`

Launches the test runner (Vitest) in the interactive watch mode.

### `pnpm run test:watch`

Runs the test runner (Vitest) in watch mode, re-running tests as files change.

### `pnpm run test:coverage`

Runs the test runner (Vitest) and generates a code coverage report.

### `pnpm run test:ui`

Runs the Vitest UI for a more visual way of tests.
