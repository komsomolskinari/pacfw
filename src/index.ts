/// ./ruleparser.ts
let smart: Smart;
class Smart {
	w = 'DIRECT';
	b = __PROXY__;
	g = 'DIRECT';
	regex = parseGFWList(__RULES__);
	chsips: [number, number, number][] = [];

	constructor(rules: string[], proxy: string) {
		(this.b = proxy), (this.regex = parseGFWList(__RULES__));
	}
	getProxy(url, host): string {
		let proxy = this.g;
		if (this.regex.white.domain?.test(host)) proxy = this.w;
		else if (this.regex.white.url?.test(url)) proxy = this.w;
		else if (!isResolvable(host)) proxy = this.b;
		else {
			const ip = dnsResolve(host);
			if (ip == null) proxy = this.b;
			else if (this.regex.black.domain?.test(host)) proxy = this.b;
			else if (this.regex.black.url?.test(url)) proxy = this.b;
			else {
				// convert_addr
				const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(
					ip
				);
				const ipnum =
					(parseInt(m[1], 10) << 16) * 256 +
					(parseInt(m[2], 10) << 16) +
					(parseInt(m[3], 10) << 8) +
					parseInt(m[4], 10);
				// binary search in ip range
				let c: number,
					l = 0,
					r = this.chsips.length;
				if (r > 0) {
					while (l != (c = (l + r) >> 1)) {
						if (this.chsips[c][0] > ipnum) r = c;
						else l = c;
					}
					if (
						this.chsips[c][0] <= ipnum &&
						this.chsips[c][0] + this.chsips[c][1] > ipnum
					)
						proxy = this.w;
				}
			}
		}
		return proxy;
	}
}
smart = new Smart(__RULES__, __PROXY__);
function FindProxyForURL(url, host): string {
	return smart.getProxy(url, host);
}
