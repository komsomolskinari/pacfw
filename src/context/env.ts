let __RULES__: string[] = [];
let __USERRULES__: string[] = [];
let __PROXY__ = 'PROXY 127.0.0.1:1080';

declare type RuleGroup = CIDRRule | GFWListRule;
interface RuleSetV1 {
	version: 1;
	rules: RuleGroup[];
}
interface CIDRRule {
	type: 'cidr';
	rules: string[];
	whitelist: boolean;
}
interface GFWListRule {
	type: 'gfwlist';
	rules: string[];
}

let __RULESET_V1__: RuleSetV1 = undefined;

function SetEnv(
	rules: string[],
	userrules: string[],
	proxy = 'PROXY 127.0.0.1:1080'
): void {
	__RULES__ = rules;
	__USERRULES__ = userrules;
	__PROXY__ = proxy;
	SetEnvEx(
		{
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
		},
		__PROXY__
	);
	//matcher = new GFWListMatcher([...__RULES__, ...__USERRULES__]);
}

function SetEnvEx(ruleset: RuleSetV1, proxy = 'PROXY 127.0.0.1:1080') {
	__RULESET_V1__ = ruleset;
	__PROXY__ = proxy;
	matchfn = CreateMatcher();
}
