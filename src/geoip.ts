/// ./ip.ts

type CIDR = [number, number];

function parseGeoIPList(rule: string[]): CIDR[] {
	const r = [];
	for (const l of rule) {
		const [net, bit] = l.split('/');
		if (net.indexOf(':') >= 0) throw new Error('TODO:ipv6');
		const hostbit = 32 - parseInt(bit);
		const netlen = 2 ** hostbit;
		const ip4 = (convertAddr4(net) >> hostbit) << hostbit;
		r.push(ip4, netlen);
	}

	return [];
}

class GeoIP4Matcher {
	net: CIDR[];
	constructor(rules: string[]) {
		this.net = parseGeoIPList(rules);
	}
	match(ip: number): boolean {
		let c: number,
			l = 0,
			r = this.net.length;
		if (r > 0) {
			while (l != (c = (l + r) >> 1)) {
				if (this.net[c][0] > ip) r = c;
				else l = c;
			}
			if (this.net[c][0] <= ip && this.net[c][0] + this.net[c][1] > ip)
				return true;
		}
		return false;
	}
}
