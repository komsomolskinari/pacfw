/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line
var __MT__filename: string;
// eslint-disable-next-line
var __MT__return: string | undefined;

const __MT__Unused = '49393543-91a1-48ec-ae49-b96bef60e492';

declare function quit(params: number): never;

function error(msg: string): void {
	if (typeof WScript !== 'undefined') {
		WScript.StdErr.WriteLine(msg);
	} else {
		if (typeof console.error !== 'undefined') console.error(msg);
		else console.log(msg); // js shell
	}
}

function exit(code: number): void {
	if (typeof WScript !== 'undefined') {
		WScript.Quit(code);
		//throw new Error();
	} else if (typeof process !== 'undefined') {
		process.exit(code);
	} else {
		quit((code % 128) + 128);
	}
}

function log(params: any): void {
	if (typeof WScript !== 'undefined') {
		WScript.Echo(params);
	} else console.log(params);
}

function report(msg: string): void {
	log(msg);
	if (__MT__return === undefined) __MT__return = msg;
}

function isarray(o): boolean {
	return typeof o.length === 'number' && typeof o !== 'string';
}

function myJSON(obj: any): string {
	switch (typeof obj) {
		case 'boolean': // true & false
			if (obj) return 'true';
			else return 'false';
		case 'bigint':
		case 'number': // 123
			return String(obj);
		case 'object': // WATCHOUT! everything is object in JS
			// get out of switch
			break;
		case 'string': // 'too young'
			return '"' + obj + '"';
		case 'symbol':
		case 'undefined':
		case 'function':
		default:
			// WTF!
			return undefined;
	}
	// so all 'object' goes here
	if (isarray(obj)) {
		// []
		const subs = [];
		for (let index = 0; index < obj.length; index++) {
			const j = myJSON(obj[index]);
			if (j !== undefined) subs.push(j);
		}
		return `[${subs.join(',')}]`;
	}
	if (obj === null) {
		// null
		return 'null';
	}
	const s: string[] = [];
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const vs = myJSON(obj[key]);
			if (vs !== undefined) s.push(`"${key}":${vs}`);
		}
	}
	// this is for {} , or  %[]
	return `{${s.join(',')}}`;
}

function dumpJSON(obj: any): string {
	if (typeof JSON !== 'undefined') {
		return JSON.stringify(obj);
	} else return myJSON(obj);
}

function checkEqual(o1: any, o2: any): boolean {
	switch (typeof o1) {
		case 'boolean': // true & false
		case 'bigint':
		case 'number': // 123
		case 'string': // 'too young'
		case 'symbol':
		case 'undefined':
		case 'function':
			return o1 === o2;
	}
	// so all 'object' goes here
	if (isarray(o1)) {
		// []
		if (o1.length !== o2.length) return false;
		for (let index = 0; index < o1.length; index++) {
			if (!checkEqual(o1[index], o2[index])) return false;
		}
		return true;
	}
	if (o1 === null) {
		// null
		return o1 === o2;
	}
	const s: string[] = [];
	for (const key in o1) {
		if (o1.hasOwnProperty(key)) {
			if (!o2.hasOwnProperty(key)) {
				return false;
			}
			if (!checkEqual(o1[key], o2[key])) return false;
		}
	}
	// this is for {} , or  %[]
	return true;
}

class TestResult {
	name: string;
	expect: any;
	invert: boolean;
	filename: string;
	constructor(name: string, filename, expect, invert = false) {
		this.name = name;
		this.expect = expect;
		this.invert = invert;
		this.filename = filename;
	}
	not(): TestResult {
		return new TestResult(this.name, this.expect, !this.invert);
	}
	private base(actual: any, message: string, comp: Function): void {
		const single = actual === __MT__Unused;
		const r = !single ? comp(this.expect, actual) : comp(this.expect);
		const invertstr = !this.invert ? 'not ' : '';
		const relation = (invertstr + message).toUpperCase();
		const casename = __MT__filename + '>' + this.name;
		if (r === this.invert) {
			const failreason = single
				? myJSON(this.expect) + ' ' + relation
				: myJSON(this.expect) + ' ' + relation + ' ' + myJSON(actual);
			report('FAIL:' + casename + ', reason:\n' + failreason);
		} else {
			log('PASS:' + casename);
		}
	}
	equal(actual: any): void {
		this.base(actual, 'equal', checkEqual);
	}
	same(actual: any): void {
		this.base(actual, 'same', (a, b) => a === b);
	}
	truthy(): void {
		this.base(__MT__Unused, 'truthy', a => (a ? true : false));
	}
}

function test(name: string, expect: any): TestResult {
	try {
		return new TestResult(name, __MT__filename, expect);
	} catch (e) {
		//error(e.message);
		if (__MT__return === undefined) __MT__return = e;
	}
}
