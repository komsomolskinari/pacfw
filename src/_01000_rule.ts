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
enum RuleType {
	Comment,
	Domain,
	String,
	Regexp,
	Prefix,
	IPv4,
	IPv6
}

interface Rule {
	matcher: string | RegExp | boolean[];
	type: RuleType;
	raw: string;
	direct: boolean; // when match, direct
}
function ParseIP4(ip: string, len: number): boolean[] {
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
	const ret = [];
	for (let mask = 0x80000000, ctr = 0; ctr < len; ctr++) {
		ret.push(ipint & mask ? true : false);
	}
}
function ParseIP6(ip: string, len: number): boolean[] {}
function ParseIP(ip: string, len: number, v4 = true): boolean[] {
	return v4 ? ParseIP4(ip, len) : ParseIP6(ip, len);
}
function ParseRule(str: string): Rule | undefined {
	let matcher: string | RegExp | boolean[] = str;
	let direct = false;
	let type = RuleType.Comment;
	const raw = str;
	if (str.substr(0, 3) === '!##') {
		matcher = str.substr(3);
		type = RuleType.IPv4;
		direct = true;
	} else if (str.substr(0, 2) === '!#') {
		matcher = str.substr(2);
		type = RuleType.IPv4;
		direct = false;
	} else if (str[0] === '!') {
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
	} else if (str[0] === '|') {
		type = RuleType.Prefix;
		matcher = str.substr(1);
	} else if (str[0] === '/') {
		type = RuleType.Regexp;
		matcher = new RegExp(str);
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
	return { matcher, direct, type, raw };
}
