type IPRange = [string, string];

// check a ip string or unified address is ipv6
function isV6(s: string): boolean {
	// 255.255.255.255/32 , 18
	if (s.length >= 20) return true;
	if (s.indexOf(':') >= 0) return true;
	return false;
}

function convertAddr4(ip4: string): string {
	// eslint-disable-next-line @typescript-eslint/camelcase
	const m = ip4.split('.');
	const ipnum =
		(parseInt(m[0], 10) << 16) * 256 + // to keep ipnum > 0
		(parseInt(m[1], 10) << 16) +
		(parseInt(m[2], 10) << 8) +
		parseInt(m[3], 10);
	return ipnum.toString(16);
}
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
		ipstrs[3] = convertAddr4(ipstr[ipstr.length - 1]);
	}
	return ipstrs.join('');
}

// output ip hex string
function convertAddr(ip46: string): string {
	return isV6(ip46) ? convertAddr6(ip46) : convertAddr4(ip46);
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
const zero8 = '00000000';
const ffff8 = 'ffffffff';
function cidrRange(cidr46: string): IPRange {
	const v6 = isV6(cidr46);

	const [rawstr, bitstr] = cidr46.split('/');
	const ipstr = convertAddr(rawstr);
	const bit = parseInt(bitstr);

	const z = v6 ? zero32 : zero8;
	const f = v6 ? ffff32 : ffff8;
	const highdigits = bit / 4;
	const lastdigitbit = bit % 4;

	const lastdigit = hex2int[ipstr.substr(highdigits, 1)];
	const llast = lmask[lastdigitbit].substr(lastdigit, 1);
	const hlast = hmask[lastdigitbit].substr(lastdigit, 1);

	const padend = highdigits + 1;

	const l = ipstr.substr(0, highdigits) + llast + z.substr(padend);
	const h = ipstr.substr(0, highdigits) + hlast + f.substr(padend);

	return [l, h];
}
