/// ./ip.ts

class GeoIPMatcher {
	net: IPRange[];
	constructor(rules: string[]) {
		for (const l of rules) {
			this.net.push(cidrRange(l));
		}
	}
	match(ip: string): boolean {
		let c: number,
			l = 0,
			r = this.net.length;
		if (r > 0) {
			while (l != (c = (l + r) >> 1)) {
				if (this.net[c][0] > ip) r = c;
				else l = c;
			}
			if (this.net[c][0] <= ip && this.net[c][1] > ip) return true;
		}
		return false;
	}
}
