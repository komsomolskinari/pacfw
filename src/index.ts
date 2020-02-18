/// ./matcher.ts
let matchfn = CreateMatcher();

function FindProxyForURL(url, host): string {
	if (typeof matchfn !== 'function') matchfn = CreateMatcher();
	return matchfn(url, host);
}
