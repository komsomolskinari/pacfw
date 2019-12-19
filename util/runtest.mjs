import ts from 'typescript';
import * as fs from 'fs';
import * as ps from 'child_process';
const TESTROOT = './test/';
const EMITROOT = './dist/_mytest/';
function complieTestCase(src) {
	const testsrc = TESTROOT + src;
	const codefiles = fs
		.readFileSync(testsrc)
		.toLocaleString()
		.split('\n', 1)[0] // line1
		.substr(2) // remove comment
		.split(',') // split by ,
		.map(s => s.trim()); // trim
	const namesrc = EMITROOT + src + '_name.ts';
	const out = EMITROOT + src + '.js';
	fs.writeFileSync(namesrc, 'filename = "' + src + '"');
	const program = ts.createProgram(
		['./util/test.ts', ...codefiles, testsrc, namesrc],
		{
			allowJs: true,
			module: ts.ModuleKind.None,
			target: ts.ScriptTarget.ES3,
			strict: false,
			outFile: out,
			esModuleInterop: true,
			moduleResolution: ts.ModuleResolutionKind.NodeJs
		}
	);
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
	console.log(`Process exiting with code '${exitCode}'.`);
	if (exitCode !== 0) process.exit(exitCode);
	return out;
}
const tests = fs.readdirSync(TESTROOT);
tests.forEach(s => {
	const o = complieTestCase(s);
	['node', 'cscript', 'js'].forEach(p => {
		try {
			ps.execSync(p + ' ' + o);
		} catch {
			console.log('fail in:' + p);
		}
	});
});
