let filename = '';
class TestResult {
	name: string;
	expect: any;
	invert: boolean;
	constructor(name: string, expect, invert = false) {
		this.name = name;
		this.expect = expect;
		this.invert = invert;
	}
	not(): TestResult {
		return new TestResult(this.name, this.expect, !this.invert);
	}
	private base(actual: any, message: string, comp: Function): void {
		const r = comp(this.expect, actual);
		if (r == this.invert) {
			const msg =
				filename +
				'TEST CASE:' +
				this.name +
				(this.invert ? 'not ' : '') +
				message;
			if (typeof WScript !== 'undefined') {
				WScript.StdErr.WriteLine(msg);
				WScript.Quit(-1);
			}
			throw new Error(msg);
		}
	}
	equal(actual: any): void {
		this.base(actual, 'equal', (a, b) => a == b);
	}
}

function mytest(name: string, expect: any): TestResult {
	return new TestResult(name, expect);
}
