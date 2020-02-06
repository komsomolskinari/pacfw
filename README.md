# PACFW

**IE6 WEB DEVELOPER WANTED**

Modified from xtons' [smart-pac].

## Developement

Run `npm i` first.

Run `npm test` to run unit test.
If test case fail, find corresponding js file in `dist/_mytest` and run it in corresponding engine.

Run `npm run build` to build for release.
You can ignore error TS2448 shown in IDE.

This project used a special build system which IDE can't understand to fullfill it's special requirement.
Put `/// _file_path_1_,_file_path_2_` at start of file to include file (It works almost same as `#include` in C).

### Requirement

-   Windows (This project is somehow Windows only, because of JScript)
-   Node.js (with NPM)
-   [JavaScriptShell]
-   Visual Studio (because of JScript debugging)
-   VSCode is suggested

## Side product

JavaScript not only means V8. We need consider SpiderMonkey and JScript/Chakra here. Node.js not always works. Although main part of this project is under LGPL, these part are under 0BSD.

### Build system

I need a lightweight module system for ECMAScript 3, Babel and Webpack not works here, so I built one.

See `util/buildsrc.mjs`.

### Test framework

No existing test framework met my requirement(running on JScript engines, has TypeScript support), so I built one.

See `util/runtest.mjs`(test runner), and `util/testlib.ts`(main runtime library).

[javascriptshell]: https://archive.mozilla.org/pub/firefox/nightly/latest-mozilla-central/
[smart-pac]: https://github.com/xtons/smart-pac
