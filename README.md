# Magic Box

A magic box which loads `HTML5` games packaged in `zip` files.

### Conventions
Magic Boxes need to strictly adhere to the following conventions for the package builder to work correctly.

- The package must contain a `js` file as the entrypoint which adds an event handler on the document `magicbox.init` event
- The `DOM` of the game needs to be constructed at runtime, as all `js` files are injected into the host `iframe` at runtime, including the main `js`
- all assets need to be declared in a `manifest.json` file
- you should never create an asset `URL` in code, the `URL`s should always be loaded from the `manifest` (more about the `manifest` later)

#### The `manifest.json`
- a single `manifest.json` file in the root of the project
- assets such as `css` and `images` should be located in
