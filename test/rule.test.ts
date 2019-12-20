/// ../src/rule.ts
/* eslint-disable @typescript-eslint/camelcase */
const true32_r = [];
for (let index = 0; index < 32; index++) {
	true32_r.push(true);
}

test('||', ParseRule('||api.ai')).equal({
	matcher: 'api.ai',
	type: RuleType.Domain,
	raw: '||api.ai',
	direct: false
});
test('@@||', ParseRule('@@||api.ai')).equal({
	matcher: 'api.ai',
	type: RuleType.Domain,
	raw: '@@||api.ai',
	direct: true
});
const commentTxt = '! basic comment';
test('!', ParseRule(commentTxt)).equal(undefined);
test('|', ParseRule('|www.google.co')).equal({
	type: RuleType.Prefix,
	raw: '|www.google.co',
	matcher: 'www.google.co',
	direct: false
});
test('@@|', ParseRule('@@|www.google.co')).equal({
	type: RuleType.Prefix,
	raw: '@@|www.google.co',
	matcher: 'www.google.co',
	direct: true
});
test('raw', ParseRule('jiang')).equal({
	type: RuleType.String,
	raw: 'jiang',
	matcher: 'jiang',
	direct: false
});
test('/regex/', ParseRule('/regex/')).equal({
	type: RuleType.Regexp,
	raw: '/regex/',
	direct: false,
	matcher: /regex/
});
test('/regex/i', ParseRule('/regex/i')).equal({
	type: RuleType.Regexp,
	raw: '/regex/i',
	direct: false,
	matcher: /regex/i
});
test('!# v4', ParseRule('!#127.0.0.1/8')).equal({
	type: RuleType.IPv4,
	raw: '!#127.0.0.1/8',
	direct: false,
	matcher: [false, true, true, true, true, true, true, true]
});
test('!# v6', ParseRule('!#ffff:ffff::1/32')).equal({
	type: RuleType.IPv6,
	raw: '!#ffff:ffff::1/32',
	direct: false,
	matcher: true32_r
});
test('!##', ParseRule('!##127.0.0.1/8')).equal({
	type: RuleType.IPv4,
	raw: '!##127.0.0.1/8',
	direct: true,
	matcher: [false, true, true, true, true, true, true, true]
});
