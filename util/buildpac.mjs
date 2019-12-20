import ts from 'typescript';
import * as fs from 'fs';
import { buildsrc, resolveDependency } from './buildsrc.mjs';
const src = resolveDependency('src/index.ts'); //fs.readdirSync('src').map(f => './src/' + f);
const option = {
	allowJs: true,
	module: ts.ModuleKind.None,
	target: ts.ScriptTarget.ES3,
	sourceMap: true,
	declaration: true,
	strict: false,
	outFile: './dist/index.js',
	esModuleInterop: true,
	moduleResolution: ts.ModuleResolutionKind.NodeJs,
	lib: []
};
buildsrc(src, option);
