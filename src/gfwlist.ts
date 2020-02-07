interface GFWListPart {
	initial: GFWListInitial;
	domain: string[];
	anywhere: GFWListAnyWhere;
}

interface GFWListInitial {
	http: string[];
	https: string[];
}
interface GFWListAnyWhere {
	plain: string[];
	regex: string[];
}
interface ParsedGFWList {
	white: GFWListPart;
	black: GFWListPart;
}

interface GFWRegex {
	white: {
		domain: RegExp;
		url: RegExp;
	};
	black: {
		domain: RegExp;
		url: RegExp;
	};
}

function parseGFWList(rule: string[]): GFWRegex {
	const gfwlist: ParsedGFWList = {
		// @@
		white: {
			initial: {
				http: [],
				https: []
			},
			domain: [],
			anywhere: {
				plain: [],
				regex: []
			}
		},
		black: {
			// |
			initial: {
				http: [], // |http:
				https: [] // |https
			},
			// ||
			domain: [],
			anywhere: {
				plain: [], // <else>
				regex: [] // /
			}
		}
	};
	const regex: GFWRegex = {
		white: {
			domain: null,
			url: null
		},
		black: {
			domain: null,
			url: null
		}
	};
	// Prepare GFWList
	for (let line of rule) {
		let list: GFWListPart = gfwlist.black;
		if (line.substr(0, 2) == '@@') {
			line = line.substring(2);
			list = gfwlist.white;
		}
		if (line.substr(0, 1) == '|' && line.substr(1, 1) != '|') {
			const init = list.initial;
			if (line.substr(5, 1) == 's') {
				line = line.substring(9);
				init.https.push(line);
			} else {
				line = line.substring(8);
				init.http.push(line);
			}
		} else if (line.substr(0, 2) == '||')
			list.domain.push(line.substring(2));
		else if (line.substr(0, 1) == '/')
			list.anywhere.regex.push(line.substring(1, line.length - 1));
		else list.anywhere.plain.push(line);
	}

	// generate regex
	function plain2regex(url: string): string {
		return url
			.replace(/\./g, '\\.')
			.replace(/\$/g, '\\$')
			.replace(/\[/g, '\\[')
			.replace(/\(/g, '\\(')
			.replace(/\|/g, '\\|')
			.replace(/\)/g, '\\)')
			.replace(/\]/g, '\\]')
			.replace(/\+/g, '\\+')
			.replace(/\?/g, '\\?')
			.replace(/\*/g, '\\.*');
	}

	function array2re(arr: string[], fn: (string) => string): string {
		const r: string[] = [];
		for (const i of arr) {
			r.push(fn(i));
		}
		return r.join('|');
	}

	function initialRule2RePart(initial: GFWListInitial): string {
		const initialRe = [];
		// |rule
		if (initial.http.length)
			initialRe.push(`://(${array2re(initial.http, plain2regex)})`);
		if (initial.https.length)
			initialRe.push(`s://(${array2re(initial.https, plain2regex)})`);
		return initialRe.join('|');
	}

	function escapeDomainRule(i: string): string {
		return i.replace(/\./g, '\\.').replace(/\*/g, '.*');
	}
	function domainRule2Re(domain: string[]): RegExp {
		if (domain.length == 0) return null;
		return new RegExp(`^(.+\\.)?(${array2re(domain, escapeDomainRule)})$`);
	}

	function urlRule2Re(part: GFWListPart): RegExp {
		const p = [];
		// |
		const initialPart = initialRule2RePart(part.initial);
		if (initialPart.length) p.push(`http(${initialPart})`);
		// string
		if (part.anywhere.plain.length)
			p.push(array2re(part.anywhere.plain, plain2regex));
		// /
		if (part.anywhere.regex.length) p.push(part.anywhere.regex.join('|'));
		return p.length ? new RegExp(p.join('|')) : null;
	}

	regex.black.url = urlRule2Re(gfwlist.black);
	regex.black.domain = domainRule2Re(gfwlist.black.domain);
	regex.white.url = urlRule2Re(gfwlist.white);
	regex.white.domain = domainRule2Re(gfwlist.white.domain);

	return regex;
}

class GFWListMatcher {
	regex = parseGFWList(__RULES__);

	constructor(rules: string[]) {
		this.regex = parseGFWList(rules);
	}

	getProxy(url, host): string {
		if (this.regex.white.domain?.test(host)) return __DIRECT__;
		if (this.regex.white.url?.test(url)) return __DIRECT__;
		if (!isResolvable(host)) return __PROXY__;

		const ip = dnsResolve(host);
		if (ip == null) return __PROXY__;
		if (this.regex.black.domain?.test(host)) return __PROXY__;
		if (this.regex.black.url?.test(url)) return __PROXY__;

		//const ipnum = convertAddr4(ip);
		// TODO: call matcher

		return __DIRECT__;
	}
}
