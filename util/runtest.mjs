import ts from 'typescript';
import * as fs from 'fs';
import * as ps from 'child_process';
const TESTROOT = './test/';
const EMITROOT = './dist/_mytest/';
const TESTLIB = './util/testlib.ts';
function complieTestCase(src) {
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
	const tailsrc = EMITROOT + src + '_tail.ts';
	const out = EMITROOT + src + '.js';
	const head = `
var __MT__filename = "${src}";
var __MT__return: string | undefined = undefined;
`;
	const tail = `
if (__MT__return !== undefined) {
	throw new Error(__MT__return)
}
`;
	fs.writeFileSync(headsrc, head);
	fs.writeFileSync(tailsrc, tail);
	// load order make sense
	const srcs = [headsrc, TESTLIB, ...codefiles, testsrc, tailsrc];
	//console.log(src, srcs);
	const program = ts.createProgram(srcs, {
		allowJs: true,
		module: ts.ModuleKind.None,
		target: ts.ScriptTarget.ES3,
		strict: false,
		outFile: out,
		esModuleInterop: true,
		moduleResolution: ts.ModuleResolutionKind.NodeJs
	});
	const emitResult = program.emit();

	const allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	allDiagnostics.forEach(diagnostic => {
		if (diagnostic.file) {
			const {
				line,
				character
			} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			const message = ts.flattenDiagnosticMessageText(
				diagnostic.messageText,
				'\n'
			);
			console.log(
				`${diagnostic.file.fileName} (${line + 1},${character +
					1}): ${message}`
			);
		} else {
			console.log(
				ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
			);
		}
	});

	const exitCode = emitResult.emitSkipped ? 1 : 0;
	if (exitCode !== 0) {
		console.error('Compile fail');
		process.exit(exitCode);
	}
	console.log('Compile success');
	return out;
}
console.log('Multi engine unit test tool v0.0.1-201912191513');

const tests = fs.readdirSync(TESTROOT);
const engines = {
	V8: 'node',
	JScript: 'cscript //Nologo',
	SpiderMonkey: 'js'
};
tests.forEach(s => {
	console.log(`=====${s}=====`);
	const o = complieTestCase(s);
	console.log(`...........`);
	Object.keys(engines).forEach(p => {
		try {
			console.log('<' + p + '>');
			console.log(
				ps
					.execSync(engines[p] + ' ' + o, { stdio: [0, 1, 0] })
					.toLocaleString()
			);
			console.log('<success>');
		} catch {
			console.log('<error>');
		}
		console.log(`...........`);
	});
});
