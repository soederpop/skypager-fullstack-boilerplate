# Fullstack Skypager Project

This project contains:

- [A Single Page React App](src)
- [A Node.js HTTP Server](server)
- [Automation Scripts](scripts)

Each of these different "apps" use the [Skypager Runtime](https://github.com/skypager/skypager) to help structure code, and to take advantage of the batteries included scripts for working with cross-platform javascript projects such as this one.

## Single Page App

To launch a local development server, which will let you edit the [code in src](src) and see the changes and get immediate feedback in the web browser.

```shell
$ yarn dev
```

To build a production build, which can be uploaded and served by the history api fallback for single page apps

```shell
$ yarn build
```

## Node.js Server

To start this app, you can run `yarn start`. Here are the different components involved in the server

This server will serve the single page app, and any API endpoints you define.

### History Fallback

This instance of the skypager server helper is configured to serve the `index.html` file in the `build` directory to handle all requests
not specifically handled by another static file in the `build/` folder, or an API endpoint defined on the express.js app as outlined below.

### Skypager Server Helper

When you run

```shell
$ node scripts/serve.js
# or
$ skypager serve
```

This script is spawning an instance of the Skypager Server Helper [@skypager/helpers-server](https://github.com/skypager/skypager/tree/master/src/helpers/server) which is an express.js based server,
with some default extensions enabled (such as cors support, json body in the requests, static file serving, history fallback API, cookies, and winston logging.)

### Server Configuration

The [server/index.js](server/index.js) module exports the configuration and hook functions for the local instance of the server. You can modify this to extend the app,
load middlewares, or whatever else you need to do.

The `appWillMount` hook runs synchronously right when the server is starting.

The `appDidMount` hook runs after all of the endpoints are defined, but before the server starts listening. You can run asynchronous methods here,
to do things like connect to a database or generate static files from your automation scripts.

To expose project specific functionality (such as specific api endpoints for the webapp), you should implement them as an endpoint.

See the following section for details.

### Endpoints

By default, all modules in [server/endpoints](server/endpoints) will be loaded. The server expects each of these modules to export a default function, which will be passed an instance of the express app.

This function will be called in the context of the server helper instance.

```javascript
export default function setupYourEndpoint(app) {
  const server = this; // instance of @skypager/helpers-server
  // the runtime that is spawning the server
  const { runtime } = server;

  app.get("/info", (req, res) => {
    res.status(200).json({
      cwd: runtime.cwd,
      gitInfo: runtime.gitInfo
    });
  });
}
```

This pattern for defining API endpoints enclosed in a function like this, makes it possible to modularize common rest endpoints and share them between servers.

In the [scripts/serve.js](scripts/serve.js) script which is used to launch the app, we create a server with the following argument

```javascript
const runtime = require("@skypager/node");
const endpoints = runtime.fsx.readdirSync(
  runtime.resolve("server", "endpoints")
);

endpoints.forEach(file => {
  runtime.endpoints.register(file.replace(".js", ""), () =>
    require(runtime.resolve("server", "endpoints", file))
  );
});

const server = runtime.server("app", {
  endpoints: "all"
});
```

By saying `endpoints: 'all'` we're going to load every endpoint that was previously registered with the endpoints registry. We previously used
the runtime's filesystem adapter to load all of the files in [server/endpoints] and treat them as endpoint modules.

If you wanted to dynamically load endpoints based on the environment, or based on some configuration, you can specify an array of names to use

```javascript
runtime.server("app", {
  endpoints: ["one", "two", "three"]
});
```

## Automation Scripts

Any file that you put in [the scripts folder](scripts) can be run with the following shell command

For example if you had `scripts/your-script.js`

```shell
$ skypager your-script
```

You can pass the `--esm` or `--babel` command line flag and add support for native import / export syntax handling. If you use the `--babel` flag you can import modules which use JSX.

Inside these scripts, if you require `skypager` or `@skypager/node` you will get the node.js instance of the skypager runtime. This module will be the same object in every
script that requires it, and will be available in the global scope as `skypager`.

Using this convention for your project automation scripts, will enable the skypager desktop app integration which gives you an enhanced UI for starting scripts, and it will also make your scripts
portable between projects if you intend to clone the same project for multiple customers or different ideas. If your package.json name starts with a `@scoped/identifier` then the `skypager` CLI will
search for all other projects that start with the same `@scope` that have a script folder, and who expose these scripts in their package.json. It will also search all of the `@skypager/*` repositories,
which gives you access to common scripts for e.g. webpack builds, webpack local dev server, test runners, etc.

You can always run these scripts with pure node.js as well, if you don't need the esm / babel support, and if you don't intend to reuse them.
