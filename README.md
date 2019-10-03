# DSF Webstore Compiler

An Electron application built for Pageworks prepress team. This compiler genreates the `main.css` file needed for building DSF webstores.

## Configuring node-sass for Electron

```sh
# Start by running the rebuild of node-sass using electron-rebuild
./node_modules/.bin/electron-rebuild -f -o node-sass
```

Copy the generated directory or `node-sass.node` binary file into the `node_modules/node-sass/vendor/` directory.
Copy the `binding.node` binary file from `node_modules/node-sass/build/Release/` directory into the `node_modules/node-sass/vendor/` directory.
