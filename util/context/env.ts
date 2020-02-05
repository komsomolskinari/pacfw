let __RULES__: string[] = [];
let __USERRULES__: string[] = [];
let __PROXY__ = 'PROXY 127.0.0.1:1080';

function SetEnv(rules: string[], userrules: string[], proxy: string) {
	__RULES__ = rules;
	__USERRULES__ = userrules;
	__PROXY__ = proxy;

	smart = new Smart([...__RULES__, ...__USERRULES__], __PROXY__);
}
