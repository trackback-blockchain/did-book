# DID Book

## Notice
* This is a clone of [Substrate Front End Template](https://github.com/substrate-developer-hub/substrate-front-end-template)
* Released under [The Unlicense](LICENSE)
* Provides exploring a DID URI, Create a DID, Resolves a DID within TrackBack, Update a DID and Revoke a DID
* Please develop further and use in production environment.

## Stable Version
* Please use [git tag 0.0.4](https://github.com/trackback-blockchain/did-book/releases/tag/0.0.4) with [TrackBack Node version 0.0.7](https://github.com/trackback-blockchain/trackback-node/tree/0.0.7)
### Installation

The codebase is installed using [git](https://git-scm.com/) and [yarn](https://yarnpkg.com/). This tutorial assumes you have installed yarn globally prior to installing it within the subdirectories. For the most recent version and how to install yarn, please refer to [yarn](https://yarnpkg.com/) documentation and installation guides.

```bash
# Clone the repository
git clone https://github.com/substrate-developer-hub/did-book.git
cd did-book
yarn install
```

## Usage

You can start the template in development mode to connect to a locally running node

```bash
yarn start
```

You can also build the app in production mode,

```bash
yarn build
```

and open `build/index.html` in your favorite browser.

## Configuration

The template's configuration is stored in the `src/config` directory, with
`common.json` being loaded first, then the environment-specific json file,
and finally environment variables, with precedence.

- `development.json` affects the development environment
- `test.json` affects the test environment, triggered in `yarn test` command.
- `production.json` affects the production environment, triggered in
  `yarn build` command.

Some environment variables are read and integrated in the template `config` object,
including:

- `REACT_APP_PROVIDER_SOCKET` overriding `config[PROVIDER_SOCKET]`
- `REACT_APP_DEVELOPMENT_KEYRING` overriding `config[DEVELOPMENT_KEYRING]`

More on [React environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables).

When writing and deploying your own front end, you should configure:

- Custom types as JSON in `src/config/types.json`. See
  [Extending types](https://polkadot.js.org/api/start/types.extend.html).
- `PROVIDER_SOCKET` in `src/config/production.json` pointing to your own
  deployed node.
- `DEVELOPMENT_KEYRING` in `src/config/common.json` be set to `false`.
  See [Keyring](https://polkadot.js.org/api/start/keyring.html).

### Specifying Connecting Node

There are two ways to specify it:

- With `PROVIDER_SOCKET` in `{common, development, production}.json`.
- With `rpc=<ws or wss connection>` query paramter after the URL. This overrides the above setting.
