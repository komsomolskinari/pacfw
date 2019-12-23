/* eslint-disable @typescript-eslint/explicit-function-return-type */
import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export function directDependency(src) {
	const cwd = path.dirname(src);
	const l1 = fs
		.readFileSync(src)
		.toLocaleString()
		.split('\n', 1)[0]; // line1
	const useimport = l1.substr(0, 3) === '///';

	return useimport
		? l1
				.substr(3) // remove comment
				.split(',') // split by ,
				.map(s => s.trim())
				.map(s => path.join(cwd, s))
		: []; // trim
}

export function resolveDependency(src) {
	src = path.join('.', src);
	const depGraph = {};
	depGraph[src] = directDependency(src);

	// check all loaded files' dep, if has not loaded, load
	function checkDep() {
		let ctr = 0;
		Object.keys(depGraph).forEach(k => {
			const val = depGraph[k];
			val.forEach(v => {
				// loaded
				if (typeof depGraph[v] !== 'undefined') {
					return;
				}
				// not loaded, load
				ctr++;
				depGraph[v] = directDependency(v);
			});
		});
		return ctr == 0;
	}
	while (!checkDep());
	//console.log(depGraph);

	const order = {};
	// calc dep depth tree
	function checkOrder(file, base) {
		if (base > 100) throw new RangeError('Possible recursive dependency');
		if (order[file] === undefined || base > order[file]) order[file] = base;
		const deps = depGraph[file];
		deps.forEach(d => checkOrder(d, base + 1));
	}
	order[src] = 1;
	checkOrder(src, 1);
	//console.log(order);

	const orderGroup = {};
	// group by depth
	Object.keys(order).forEach(k => {
		const v = order[k];
		if (orderGroup[v] === undefined) orderGroup[v] = [];
		orderGroup[v].push(k);
	});
	//console.log(orderGroup);

	const ranges = Object.keys(orderGroup).map(k => parseInt(k));
	const max = Math.max(...ranges);
	const min = Math.min(...ranges);

	// output from depest
	const flated = [];
	for (let p = max; p >= min; p--) {
		flated.push(...orderGroup[p]);
	}
	//console.log(flated);
	return flated;
}

export function buildsrc(src, option) {
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

export function build(src, optionfile = './util/option.json') {
	const f = fs.readFileSync(optionfile);
	const option = JSON.parse(f);
	buildsrc(resolveDependency(src), option);
}
