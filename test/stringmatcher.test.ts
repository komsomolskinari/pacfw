/// ../src/rule.ts,../src/stringmatcher.ts

const rules = [
	'||google.com',
	'@@||api.aixcoder',
	'||api.ai',
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
test('match multiple rule', sm.search('api.aixcoder.com')).sameContent([
	ParseRule('@@||api.aixcoder'),
	ParseRule('||api.ai')
]);
test('match empty', sm.search('github.com')).equal([]);
