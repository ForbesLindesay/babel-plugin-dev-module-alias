# babel-plugin-dev-module-alias

## Installation

    npm install babel-plugin-dev-module-alias --save-dev

## Usage

.babelrc
```js
{
  "presets": ["forbeslindesay"],
  "plugins": [],
  "env": {
    "development": {
      "plugins": [
        "dev-module-alias"
      ]
    }
  }
}
```

Then in an npm module you depend on (e.g. [bicycle](https://github.com/bicyclejs/bicycle)) you can use code like:

package.json
```js
{
  // ...
  "developmentVersions": {
    "bicycle/lib/": "bicycle/dev/"
  }
}
```

This will replace all calls to `require('bicycle/lib/whatever')` with `require('bicycle/dev/whatever')`.  This is useful for adding runtime type-checking etc. that you don't want to have included in production by accident.
