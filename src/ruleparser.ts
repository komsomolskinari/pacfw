const rule = [...__RULES__, ...__USERRULES__];
const gfwlist = {
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
		pureip: [],
		domain: [],
		anywhere: {
			domain: [],
			plain: [],
			regex: []
		}
	}
};
const regex = {
	white: {
		domain: null,
		url: null
	},
	black: {
		pureip: null,
		domain: null,
		url: null
	}
};
const reComment = /^(\[.*\]|[ \f\n\r\t\v]*|\!.*)$/;
const reInitial = /^\|https?:\/\/[0-9a-zA-Z-_.*?&=%~/:]+$/;
const rePureip = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const reDomain = /^\|\|[0-9a-zA-Z-.*]+\/?$/; // 明确的domain中有可能包含*通配符
const reRegex = /^\/.*\/$/;
const reDomain2 = /^[0-9a-zA-Z-.]+$/; // 经常有domain混在url模式中，此时*通配符通常与url相关
const reAnywhere = /^[0-9a-zA-Z-_.*?&=%~/:]+$/;
const reGroup = /\|/g;

// Prepare GFWList
let list;
for (let line of rule) {
	if (line.startsWith('@@')) {
		line = line.substring(2);
		list = gfwlist.white;
	} else list = gfwlist.black;
	if (reInitial.test(line)) {
		list = list.initial;
		if (line[5] == 's') {
			line = line.substring(9);
			list = list.https;
		} else {
			line = line.substring(8);
			list = list.http;
		}
		list.push(line);
	}
	//else if (rePureip.test(line)) list.pureip.push(line); // it's not pure ip, it's string rule
	else if (reDomain.test(line)) list.domain.push(line.substring(2));
	else if (reRegex.test(line)) {
		if (line.match(reGroup) != null && line.match(reGroup).length < 20)
			list.anywhere.regex.push(line.substring(1, line.length - 1));
	} else if (reDomain2.test(line)) list.anywhere.domain.push(line);
	else if (reAnywhere.test(line)) list.anywhere.plain.push(line);
}

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
if (regArray.length) regex.black.url = regArray.join('|');

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
if (regArray.length) regex.black.domain = `^(.+\\.)?(${regArray.join('|')})$`;

if (gfwlist.black.pureip.length)
	regex.black.pureip = `^(${array2re(gfwlist.black.pureip, txt =>
		txt.replace(/\./g, '\\.')
	)})$`;

regArray = []; // ready for smart.regex.white.url
if (gfwlist.white.initial.http.length)
	regArray.push(`://(${array2re(gfwlist.white.initial.http, plain2regex)})`);

if (gfwlist.white.initial.https.length)
	regArray.push(
		`s://(${array2re(gfwlist.white.initial.https, plain2regex)})`
	);
if (regArray.length) regex.white.url = `^http(${regArray.join('|')})`;

if (gfwlist.white.domain.length)
	regex.white.domain = `^(.+\\.)?(${array2re(gfwlist.white.domain, domain =>
		domain.replace(/\./g, '\\.').replace(/\*/g, '.*')
	)})$`;
