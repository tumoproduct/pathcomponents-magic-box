var argv = require('yargs').argv;
var chalk = require('chalk');
var fs = require("fs");
var JSZip = require("jszip");
var UglifyJS = require("uglify-js");
var csso = require('csso');
var base64Img = require('base64-img');
var path = require('path');
var ora = require('ora');
var moment = require('moment');

var zip = new JSZip();

console.log
(`
  _  _ ____ ____ _ ____    ___  ____ _  _
  |\\/| |__| | __ | |       |__] |  |  \\/
  |  | |  | |__] | |___    |__] |__| _/\\_

`)

// check for path param
if(!argv.path)
{
  console.log(`${chalk.red("Error:")} please specify a project with the ${chalk.yellow("--path")} option`);
  process.exit();
}

// try accessing path
try
{
  process.chdir(argv.path);
}
catch(err)
{
  console.log(`${chalk.red("Error:")} couldn't process project in ${chalk.yellow(argv.path)}, check the project path and try again`);
  process.exit();
}

var _spinner = ora("loading manifest").start();

// read manifest
fs.readFile("manifest.json", function(err, data)
{
  if(err)
  {
    _spinner.fail(`${chalk.red("Error:")} reading ${chalk.yellow("manifest.json")}, please make sure it exists and try again.`);
    process.exit();
  }

  // parse manifest
  try
  {
    var manifest = JSON.parse(data);
  }
  catch(err)
  {
    _spinner.fail(`${chalk.red("Error:")} parsing ${chalk.yellow("manifest.json")}`);
    console.log(err);
    process.exit();
  }

  // check for existence of src
  if(typeof manifest.src == "undefined")
  {
    _spinner.fail(`${chalk.red("Error:")} you must include a ${chalk.yellow("src")} field`);
    process.exit();
  }

  // check src contains at least one element
  if(manifest.src.length == 0)
  {
    _spinner.fail(`${chalk.red("Error:")} you must include at least one ${chalk.yellow("src")} as the entry point`);
    console.log(err);
    process.exit();
  }

  var scripts = {};
  var css = [];

  _spinner.succeed();

  _spinner = ora("processing libs").start();

  // add libs to scripts
  if(typeof manifest.libs != "undefined")
  {
    for(var i = 0; i < manifest.libs.length; ++i)
    {
      scripts[manifest.libs[i]] = fs.readFileSync(manifest.libs[i], 'utf8');
    }
  }

  _spinner.succeed();

  _spinner = ora("processing css").start();

  // add css files
  if(typeof manifest.css != "undefined")
  {
    for(var i = 0; i < manifest.css.length; ++i)
    {
      var file = fs.readFileSync(manifest.css[i], 'utf8');
      file = inlineImages(file, manifest.css[i]);

      css.push(file);
    }
  }

  _spinner.succeed();

  // add src to scripts
  for(var i = 0; i < manifest.src.length; ++i)
  {
    scripts[manifest.src[i]] = fs.readFileSync(manifest.src[i], 'utf8');
  }

  _spinner = ora("processing assets").start();

  // add assets to zip
  if(typeof manifest.assets != "undefined")
  {
    for(var i in manifest.assets)
    {
      zip.file(manifest.assets[i], fs.readFileSync(manifest.assets[i]));
    }
  }

  if(typeof manifest.namedAssets != "undefined")
  {
    for(var i in manifest.namedAssets)
    {
      zip.file(manifest.namedAssets[i], fs.readFileSync(manifest.namedAssets[i]));
    }
  }

  _spinner.succeed();

  manifest.libs = [];
  manifest.src = ["main.js"];
  manifest.css = ["main.css"];

  _spinner = ora("minifying scripts").start();

  var jsminified = UglifyJS.minify
  (
    scripts,
    {
      mangle: true,
      compress : true
    }
  ).code.replace("\"use strict\";", "");

  // minify scripts
  zip.file
  (
    "main.js", jsminified
  );

  _spinner.succeed();

  _spinner = ora("minifying css").start();

  // minify css
  var maincss = "";
  for(var i = 0; i < css.length; ++i)
  {
    maincss += csso.minify(css[i]).css;
  }

  var imports = [];

  // find imports
  maincss = maincss.replace
  (
    /@import url\((.+?)\);/ig, function(wmatch, match)
    {
      imports.push(match);
      return "";
    }
  );

  // move imports to beginning of css
  var cssheader = "";
  for(var i = 0; i < imports.length; ++i)
  {
    cssheader += "@import url(" + imports[i] + ");\n";
  }

  // add css to zip
  zip.file("main.css", cssheader + maincss);

  _spinner.succeed();

  // export zip
  exportZip();

  function exportZip()
  {
    _spinner = ora("exporting magic box").start();

    zip.file("manifest.json", JSON.stringify(manifest));

    // create build folder if not exist
    if(!fs.existsSync('build'))
    {
      fs.mkdirSync('build');
    }

    // write zip
    zip
    .generateNodeStream
    ({
      type: 'nodebuffer',
      streamFiles: true
    })
    .pipe
    (
      fs.createWriteStream
      (
        `build/${findName()}-${moment().format("YYYY-DD-MM-hh-mm")}.zip`
      )
    )
    .on('finish', function ()
    {
      _spinner.succeed();
    });
  }

  function inlineImages(content, file)
  {
    return content.replace(/\: url\('(.+?)'\);/ig, function(wmatch, match)
    {
      if(wmatch.indexOf("data:image") != -1)
      {
        return wmatch;
      }
      else
      {
        var folder = path.dirname(file);

        return ": url('" + base64Img.base64Sync(folder + "/" + match) + "');";
      }
    });
  }

  function findName()
  {
    if(argv.name)
    {
      return argv.name
    }

    if(fs.existsSync("package.json"))
    {
      var pkg = fs.readFileSync("package.json");
      try
      {
        pkg = JSON.parse(pkg);
        return pkg.name;
      }
      catch(err)
      {

      }
    }

    if(fs.existsSync("bower.json"))
    {
      var pkg = fs.readFileSync("bower.json");
      try
      {
        pkg = JSON.parse(pkg);
        return pkg.name;
      }
      catch(err)
      {

      }
    }

    return "build";
  }
});