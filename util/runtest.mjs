import buildsrc from './buildsrc.mjs';
import ts from 'typescript';
import * as fs from 'fs';
import * as ps from 'child_process';
const TESTROOT = './test/';
const EMITROOT = './dist/_mytest/';
const TESTLIB = './util/testlib.ts';
function compileTestCase(src) {
	const testsrc = TESTROOT + src;
	const l1 = fs
		.readFileSync(testsrc)
		.toLocaleString()
		.split('\n', 1)[0]; // line1
	const useimport = l1.substr(0, 3) === '///';

	const codefiles = useimport
		? l1
				.substr(3) // remove comment
				.split(',') // split by ,
				.map(s => s.trim())
		: []; // trim
	const headsrc = EMITROOT + src + '_head.ts';
	const out = EMITROOT + src + '.js';
	const head = 'var __MT__filename = "' + src + '";\n';

	fs.writeFileSync(headsrc, head);
	//fs.writeFileSync(tailsrc, tail);
	// load order make sense
	const srcs = [
		headsrc,
		'./util/test_start.ts',
		TESTLIB,
		...codefiles,
		testsrc,
		'./util/test_end.ts'
	];
	const options = {
		allowJs: true,
		module: ts.ModuleKind.None,
		target: ts.ScriptTarget.ES3,
		sourceMap: true,
		declaration: true,
		strict: false,
		outFile: out,
		esModuleInterop: true,
		moduleResolution: ts.ModuleResolutionKind.NodeJs
	};
	buildsrc(srcs, options);
	return out;
}
console.log('Multi engine unit test tool v0.0.1-201912191817');

const tests = fs.readdirSync(TESTROOT);
const engines = {
	V8: 'node',
	JScript: 'cscript //Nologo',
	SpiderMonkey: 'js'
};
tests.forEach(s => {
	console.log(`=====${s}=====`);
	const o = compileTestCase(s);
	Object.keys(engines).forEach(p => {
		const logfile = o + '.' + p + '.log';
		try {
			console.log(`...........`);
			console.log('<' + p + '>');
			ps.execSync(engines[p] + ' ' + o + '> ' + logfile);
			console.log('<PASS>');
		} catch {
			console.log(fs.readFileSync(logfile).toLocaleString());
			console.log('<FAIL>');
		}
	});
});
