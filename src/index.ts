/// ./gfwlist.ts,./geoip.ts
const __DIRECT__ = 'DIRECT';

const ruleset: RuleSetV1 =
	typeof __RULESET_V1__ === 'undefined'
		? {
				version: 1,
				rules: [
					{
						type: 'gfwlist',
						rules: __USERRULES__
					},
					{
						type: 'gfwlist',
						rules: __RULES__
					}
				]
		  }
		: __RULESET_V1__;

interface Matcher {
	match(url: string, host: string): boolean;
}

const matchers: Matcher[] = [];

for (const r of ruleset.rules) {
	switch (r.type) {
		case 'cidr':
			matchers.push(new GeoIPMatcher(r.rules, !r.whitelist));
			break;
		case 'gfwlist':
			matchers.push(new GFWListMatcher(r.rules));
			break;
	}
}

function FindProxyForURL(url, host): string {
	for (const m of matchers) {
		const r = m.match(url, host);
		if (r !== null) return r ? __PROXY__ : __DIRECT__;
	}
	return __DIRECT__;
	//return matcher.getProxy(url, host);
}
