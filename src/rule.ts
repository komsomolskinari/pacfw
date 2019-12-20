/// ./ipparse.ts
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
