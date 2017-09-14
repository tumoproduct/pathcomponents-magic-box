# Magic Box

A magic box which loads `HTML5` games packaged in `zip` files.

### Conventions
Magic Boxes need to strictly adhere to the following conventions for the package builder to work correctly.

- The package must contain a `js` file as the entry point which should add an event handler on the document `magicbox.init` event. This event is fired when the `manifest` has been initialised.

    The `magicbox.init` event has four objects in the `detail` property:  
    1. `manifest` the initialised manifest
    2. `container` the `root` `DOM` element
    3. `data` data saved by the user which can be used to reload the previous state
    4. `ready` the function to call when the `magic box` is ready


- The `DOM` of the game needs to be constructed at runtime, as all `js` files are injected into the host `iframe` at runtime, including the main `js`
- all assets need to be declared in a `manifest.json` file
- you should never create an asset `URL` in code, the `URL`s should always be loaded from the `manifest` (more about the `manifest` later)
- it is recommended to place assets such as `css` and `images` in an `assets` folder in the root of the project

#### The `manifest.json`

- a single `manifest.json` file should exist in the root of the project
- the `manifest` must include a `dimension` field specifying a `width` and `height` in `pixels` e.g.
```  
    "dimension":
    {
      "width": 520,
      "height": 380
    }
```
- the `manifest` must include a `src` field specifying the main source to load. They will be loaded in the order specified so the `main` script should come last.
- the `manifest` can include a `css` field. The `css` assets will be loaded before the `src` assets.
- the `manifest` can include a `libs` field which specifies a list of `js` libraries to use, these will be loaded before the `src` assets.
- the `manifest` can include an `assets` field which declares all of the other assets that are needed, as a `key`/`value` pair with the `key` being a __unique__ identifier and the value a __relative__ `path` to the asset e.g.
```  
    "assets":
    {
  	  "frame-0001": "assets/frames/frame-0001.png",
  	  "frame-0002": "assets/frames/frame-0002.png"
    }
```

### Building

To build the your `magic box`, run the included `build` script with the `--path` option as the __path__ to your project. This will create a `zip` file in a __build__ directory in the root of your project. The name of the `zip` file will be name of the package found in either a `package.json`,`bower.json`, or `build`, with the current `date-time` as the suffix. To override this behavior, provide a `--name` option.

### Demos and Template
To try out built magic boxes:  
1. run `yarn run polyserve` and then point your browser to the address printed on the terminal followed by `/demo` e.g. `http://127.0.0.1:8081/components/magic-box/demo`
2. either drag and drop a file into the loader or click on the loader to select a file

#### Astray Demo
There's a demo provided in the `astray` folder, a game adapted from https://github.com/wwwtyro/Astray. You can run it two ways:
1. run a simple `HTTP` server from the folder, e.g. `npm`'s `http-server`
2. `build` the game and drag and drop it on the `magic box` loader

#### Template
There's a template provided in the `template` folder which has enough to get you started. Don't forget to add all of the required assets in the `manifest`.
