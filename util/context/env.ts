let __RULES__: string[] = [];
let __USERRULES__: string[] = [];
let __PROXY__ = 'PROXY 127.0.0.1:1080';

const __DIRECT__ = 'DIRECT';

function SetEnv(
	rules: string[],
	userrules: string[],
	proxy = 'PROXY 127.0.0.1:1080'
) {
	__RULES__ = rules;
	__USERRULES__ = userrules;
	__PROXY__ = proxy;

	smart = new Smart([...__RULES__, ...__USERRULES__], __PROXY__);
}
