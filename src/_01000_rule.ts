/**
 * ! comment
 * || domainmatch
 * | match from soh
 * @@ whitelist prefix
 * rawstring string match (.aaa.com)
 * / regex
 *
 * extended syntax
 * !# ip proxy
 * !## ip direct
 */
/*
 * ip  \ domain | proxy | none      | direct
 * proxy        | proxy | proxy     | proxy
 * none         | proxy | direct    | direct
 * direct       | proxy | direct    | direct
 */

function IPv4toInt(ip: string): number {
	const ipnums = [0, 0, 0, 0];
	const iparray = ip.split('.');
	let ipint = 0;
	for (let index = 0; index < iparray.length - 1; index++) {
		ipnums[index] = parseInt(iparray[index]);
	}
	ipnums[3] = parseInt(iparray[iparray.length - 1]);
	if (iparray.length === 1 && ipnums[0] >= 256) ipint = ipnums[0];
	else {
		ipint =
			256 * 256 * 256 * ipnums[0] +
			256 * 256 * ipnums[1] +
			256 * ipnums[2] +
			ipnums[3];
	}
	return ipint;
}
function IPv6toInt(ip: string): [number, number, number, number] {
	const ipstr = ip.split(':');
	const head = [];
	const tail = [];
	const mappedv4 = ipstr[ipstr.length - 1].indexOf('.') >= 0;
	let inhead = true;
	for (let index = 0; index < ipstr.length; index++) {
		const element = ipstr[index];
		if (element.length === 0) {
			inhead = false;
			continue;
		}
		if (inhead) head.push(element);
		else tail.push(element);
	}
	// replace last 32 bit with 0
	if (mappedv4) {
		tail.pop();
		tail.push('0', '0');
	}
	const ipint16 = [0, 0, 0, 0, 0, 0, 0, 0];
	for (let index = 0; index < head.length; index++) {
		const element = head[index];
		ipint16[index] = parseInt('0x' + element);
	}
	for (let index = tail.length - 1, ptr = 7; index >= 0; index--, ptr--) {
		const element = tail[index];
		ipint16[ptr] = parseInt('0x' + element);
	}
	function i16i32(i1: number, i2: number): number {
		return 65536 * i1 + i2;
	}
	const ipints: [number, number, number, number] = [
		i16i32(ipint16[0], ipint16[1]),
		i16i32(ipint16[2], ipint16[3]),
		i16i32(ipint16[4], ipint16[5]),
		i16i32(ipint16[6], ipint16[7])
	];
	if (mappedv4) ipints[3] = IPv4toInt(ipstr[ipstr.length - 1]);
	return ipints;
}
function Int32toBoolArray(int: number): boolean[] {
	const ret = [];
	for (let mask = 0x80000000, ctr = 0; ctr < 32; ctr++, mask >>>= 1) {
		ret.push((int & mask) !== 0 ? true : false);
	}
	return ret;
}

function ParseIPv4(ip: string, len = 0): boolean[] {
	if (len === 0) len = 32;
	const ipint = IPv4toInt(ip);
	return Int32toBoolArray(ipint).slice(0, len);
}
function ParseIPv6(ip: string, len = 0): boolean[] {
	if (len === 0) len = 128;
	const bin = [];
	const int = IPv6toInt(ip);
	for (let index = 0; index < int.length; index++) {
		const element = Int32toBoolArray(int[index]);
		bin.push(...element);
	}
	return bin.slice(0, len);
}
function ParseIP(ip: string, len = 0, v4 = true): boolean[] {
	return v4 ? ParseIPv4(ip, len) : ParseIPv6(ip, len);
}

function ParseRegex(re: string): RegExp {
	const flagStart = re.lastIndexOf('/');
	const flag = re.substr(flagStart + 1);
	const m = re.substr(1, flagStart - 1);
	return new RegExp(m, flag);
}

enum RuleType {
	Comment,
	Domain,
	String,
	Regexp,
	Prefix,
	IPv4,
	IPv6
}
type RuleMatcher =
	| string // basic
	| RegExp // Regexp
	| boolean[] // IP
	| string[]; // asterisk
interface Rule {
	matcher: RuleMatcher;
	type: RuleType;
	raw: string;
	direct: boolean; // when match, direct
}

function ParseRule(str: string): Rule | undefined {
	let matcher: RuleMatcher = str;
	let direct = false;
	let type = RuleType.String;
	const raw = str;
	if (str.substr(0, 3) === '!##') {
		matcher = str.substr(3);
		type = RuleType.IPv4;
		direct = true;
	} else if (str.substr(0, 2) === '!#') {
		matcher = str.substr(2);
		type = RuleType.IPv4;
		direct = false;
	} else if (str.substr(0, 1) === '!') {
		return undefined;
	}
	if (str.substr(0, 2) === '@@') {
		direct = true;
		str = str.substr(2);
		matcher = str.substr(2);
	}

	if (str.substr(0, 2) === '||') {
		type = RuleType.Domain;
		matcher = str.substr(2);
	} else if (str.substr(0, 1) === '|') {
		type = RuleType.Prefix;
		matcher = str.substr(1);
	} else if (str.substr(0, 1) === '/') {
		type = RuleType.Regexp;
		matcher = ParseRegex(str);
	}

	if (type == RuleType.IPv4) {
		if ((matcher as string).indexOf(':') >= 0) {
			type = RuleType.IPv6;
		}
		const bitstr = (matcher as string).split('/')[1] ?? '0';
		const ipstr = (matcher as string).split('/')[0];
		let bitlen = parseInt(bitstr);
		if (bitlen === 0) bitlen = type === RuleType.IPv4 ? 32 : 128;
		matcher = ParseIP(ipstr, bitlen, type === RuleType.IPv4);
	}

	if (typeof matcher === 'string' && matcher.indexOf('*') > 0) {
		switch (type) {
			case RuleType.Domain:
			case RuleType.Prefix:
			case RuleType.String:
				matcher = matcher.split('*');
				break;
			default:
				break;
		}
	}
	return { matcher, direct, type, raw };
}
