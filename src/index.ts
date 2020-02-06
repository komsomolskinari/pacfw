/// ./gfwlist.ts
const __DIRECT__ = 'DIRECT';

let matcher = new GFWListMatcher([...__RULES__, ...(__USERRULES__ ?? [])]);
function FindProxyForURL(url, host): string {
	return matcher.getProxy(url, host);
}
