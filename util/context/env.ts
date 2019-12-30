let __RULES__ = [];
let __USERRULES__ = [];
let __PROXY__ = 'PROXY 127.0.0.1:1080';

function SetEnv(rules: string[], userrules: string[], proxy: string) {
	__RULES__ = rules;
	__USERRULES__ = userrules;
	__PROXY__ = proxy;
}
