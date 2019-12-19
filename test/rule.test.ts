/// ./src/_01000_rule.ts

test('ipv4 int 127.1', IPv4toInt('127.1')).equal(0x7f000001);

test('ipv4 127.1', ParseIPv4('127.0.0.1', 8)).equal([
	false,
	true,
	true,
	true,
	true,
	true,
	true,
	true
]);
test('ipv4 255.1', ParseIPv4('255.0.0.1', 8)).equal([
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true
]);

test('ipv4 int 192.168.1.1', IPv4toInt('192.168.1.1')).equal(0xc0a80101);

test('ipv4 192.168/16', ParseIPv4('192.168.1.1', 16)).equal([
	true,
	true,
	false,
	false,
	false,
	false,
	false,
	false,
	true,
	false,
	true,
	false,
	true,
	false,
	false,
	false
]);

test('ipv6 int ::1', IPv6toInt('::1')).equal([0, 0, 0, 1]);
test('ipv6 int 2000:1234::1', IPv6toInt('2000:1234::1')).equal([
	0x20001234,
	0,
	0,
	1
]);
test('ipv6 int 2000:1234::1:1', IPv6toInt('2000:1234::1:1')).equal([
	0x20001234,
	0,
	0,
	0x00010001
]);
test('ipv6 int 2000:1234::1:1:0', IPv6toInt('2000:1234::1:1:0')).equal([
	0x20001234,
	0,
	1,
	0x00010000
]);
test('ipv6 int 2000:abcd::127.0.0.1', IPv6toInt('2000:Abcd::127.0.0.1')).equal([
	0x2000abcd,
	0,
	0,
	0x7f000001
]);

const true32 = [];
for (let index = 0; index < 32; index++) {
	true32.push(true);
}
test('ipv6 ffff:ffff/32', ParseIPv6('ffff:ffff::', 32)).equal(true32);

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
	matcher: true32
});
test('!##', ParseRule('!##127.0.0.1/8')).equal({
	type: RuleType.IPv4,
	raw: '!##127.0.0.1/8',
	direct: true,
	matcher: [false, true, true, true, true, true, true, true]
});
