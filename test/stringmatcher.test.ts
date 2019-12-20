/// ../src/rule.ts,../src/stringmatcher.ts

const rules = [
	'||google.com',
	'@@||api.aixcoder',
	'@@baidu.com',
	'||facebook.com'
];

const sm = new StringMatcher();
for (const key in rules) {
	if (rules.hasOwnProperty(key)) {
		const r = ParseRule(rules[key]);
		if (
			r.type === RuleType.Domain ||
			r.type === RuleType.Prefix ||
			r.type === RuleType.String
		)
			sm.add(r.matcher as string, r);
	}
}

test('match string', sm.search('google.com')).equal([
	ParseRule('||google.com')
]);
