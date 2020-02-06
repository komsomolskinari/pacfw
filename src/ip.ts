function convertAddr4(ip4: string): number {
	// eslint-disable-next-line @typescript-eslint/camelcase
	if (typeof convert_addr == 'function') return convert_addr(ip4);
	const m = ip4.split('.');
	const ipnum =
		(parseInt(m[0], 10) << 16) * 256 +
		(parseInt(m[1], 10) << 16) +
		(parseInt(m[2], 10) << 8) +
		parseInt(m[3], 10);
	return ipnum;
}

// output ipv6 address in all lowercase hex format
function convertAddr6(ip6: string): string {
	const ipstr = ip6.split(':');
	if (ipstr.length < 2) return undefined;
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
		if (element.length > 4 && element.indexOf('.') < 0) return undefined;
		if (inhead) head.push(element);
		else tail.push(element);
	}
	// replace last 32 bit ipv4 with two 16 bit 0
	if (mappedv4) {
		tail.pop();
		tail.push('0', '0');
	}
	const ipstr16 = [
		'0000',
		'0000',
		'0000',
		'0000',
		'0000',
		'0000',
		'0000',
		'0000'
	];

	const highfill = ['0000', '000', '00', '0', ''];
	for (let index = 0; index < head.length; index++) {
		const element = head[index];
		ipstr16[index] = highfill[element.length] + element;
	}
	for (let index = tail.length - 1, ptr = 7; index >= 0; index--, ptr--) {
		const element = tail[index];
		ipstr16[ptr] = highfill[element.length] + element;
	}
	const ipstrs = [
		ipstr16[0] + ipstr16[1],
		ipstr16[2] + ipstr16[3],
		ipstr16[4] + ipstr16[5],
		ipstr16[6] + ipstr16[7]
	];
	if (mappedv4) {
		ipstrs[3] = convertAddr4(ipstr[ipstr.length - 1]).toString(16);
	}
	return ipstrs.join('');
}

const hex2int = {
	'0': 0,
	'1': 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	a: 10,
	b: 11,
	c: 12,
	d: 13,
	e: 14,
	f: 15
};

const lmask = [
	'0000000000000000',
	'0000000088888888',
	'000044448888cccc',
	'0022446688aaccee'
];
const hmask = [
	'ffffffffffffffff',
	'77777777ffffffff',
	'33337777bbbbffff',
	'1133557799bbddff'
];

const zero32 = '00000000000000000000000000000000';
const ffff32 = 'ffffffffffffffffffffffffffffffff';
function net6Range(ip6str: string, bit: number): [string, string] {
	if (ip6str.indexOf(':') >= 0) ip6str = convertAddr6(ip6str);
	const highdigits = bit / 4;
	const lastdigitbit = bit % 4;

	const lastdigit = hex2int[ip6str.substr(highdigits, 1)];
	const llast = lmask[lastdigitbit][lastdigit];
	const hlast = hmask[lastdigitbit][lastdigit];

	const padend = highdigits + 1;

	const l = ip6str.substr(0, highdigits) + llast + zero32.substr(padend);
	const h = ip6str.substr(0, highdigits) + hlast + ffff32.substr(padend);

	return [l, h];
}
