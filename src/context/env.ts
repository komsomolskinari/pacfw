let __RULES__: string[] = [];
let __USERRULES__: string[] = [];
let __PROXY__ = 'PROXY 127.0.0.1:1080';

function SetEnv(
	rules: string[],
	userrules: string[],
	proxy = 'PROXY 127.0.0.1:1080'
): void {
	__RULES__ = rules;
	__USERRULES__ = userrules;
	__PROXY__ = proxy;

	matcher = new GFWListMatcher([...__RULES__, ...__USERRULES__]);
}
