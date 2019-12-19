import ts from 'typescript';

export default function buildsrc(src, option) {
	const program = ts.createProgram(src, option);
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
	return;
}
