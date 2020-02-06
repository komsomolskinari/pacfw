interface GFWListPart {
	initial: {
		http: string[];
		https: string[];
	};
	domain: string[];
	anywhere?: {
		domain: string[];
		plain: string[];
		regex: string[];
	};
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
		white: {
			initial: {
				http: [],
				https: []
			},
			domain: []
		},
		black: {
			initial: {
				http: [],
				https: []
			},
			domain: [],
			anywhere: {
				domain: [],
				plain: [],
				regex: []
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
	let list;
	for (let line of rule) {
		if (line.substr(0, 2) == '@@') {
			line = line.substring(2);
			list = gfwlist.white;
		} else list = gfwlist.black;
		if (line.substr(0, 1) == '|' && line.substr(1, 1) != '|') {
			list = list.initial;
			if (line.substr(5, 1) == 's') {
				line = line.substring(9);
				list = list.https;
			} else {
				line = line.substring(8);
				list = list.http;
			}
			list.push(line);
		}
		//else if (rePureip.test(line)) list.pureip.push(line); // it's not pure ip, it's string rule
		else if (line.substr(0, 2) == '||') list.domain.push(line.substring(2));
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

	let regArray = []; // ready for regex.black.url
	if (
		gfwlist.black.initial.http.length > 0 ||
		gfwlist.black.initial.https.length > 0
	) {
		if (gfwlist.black.initial.http.length)
			regArray.push(
				`://(${array2re(gfwlist.black.initial.http, plain2regex)})`
			);
		if (gfwlist.black.initial.https.length)
			regArray.push(
				`s://(${array2re(gfwlist.black.initial.https, plain2regex)})`
			);
		regArray = [`http(${regArray.join('|')})`];
	}
	if (gfwlist.black.anywhere.plain.length)
		regArray.push(array2re(gfwlist.black.anywhere.plain, plain2regex));
	if (gfwlist.black.anywhere.regex.length)
		regArray.push(gfwlist.black.anywhere.regex.join('|'));
	if (regArray.length) regex.black.url = new RegExp(regArray.join('|'));

	regArray = []; // ready for regex.black.domain
	if (gfwlist.black.domain.length)
		regArray.push(
			array2re(gfwlist.black.domain, domain =>
				domain.replace(/\./g, '\\.').replace(/\*/g, '.*')
			)
		);
	if (gfwlist.black.anywhere.domain.length)
		regArray.push(
			array2re(gfwlist.black.anywhere.domain, domain2 =>
				(domain2[0] == '.' ? domain2.substring(1) : domain2)
					.replace(/\./g, '\\.')
					.replace(/\*/g, '.*')
			)
		);
	if (regArray.length)
		regex.black.domain = new RegExp(`^(.+\\.)?(${regArray.join('|')})$`);

	regArray = []; // ready for smart.regex.white.url
	if (gfwlist.white.initial.http.length)
		regArray.push(
			`://(${array2re(gfwlist.white.initial.http, plain2regex)})`
		);

	if (gfwlist.white.initial.https.length)
		regArray.push(
			`s://(${array2re(gfwlist.white.initial.https, plain2regex)})`
		);
	if (regArray.length)
		regex.white.url = new RegExp(`^http(${regArray.join('|')})`);

	if (gfwlist.white.domain.length)
		regex.white.domain = new RegExp(
			`^(.+\\.)?(${array2re(gfwlist.white.domain, domain =>
				domain.replace(/\./g, '\\.').replace(/\*/g, '.*')
			)})$`
		);

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
