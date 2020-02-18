// following variable should provided in PAC's context
declare let __RULES__: string[];
declare let __USERRULES__: string[];
declare let __PROXY__: string;

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

declare let __RULESET_V1__: RuleSetV1;
