/// ./ip.ts

class GeoIPMatcher implements Matcher {
	net: IPRange[];
	blacklist: boolean;
	constructor(rules: string[], blacklist = true) {
		for (const l of rules) {
			this.net.push(cidrRange(l));
		}
		this.blacklist = blacklist;
	}
	match(url: string, host: string): boolean {
		const ip = dnsResolve(host);
		if (ip === null) return null;
		const result = this.matchip(ip);
		// true: matched, look at blacklist, false: not matched, null
		return result ? this.blacklist : null;
	}
	matchip(ip: string): boolean {
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
