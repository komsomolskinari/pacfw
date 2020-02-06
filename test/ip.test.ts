///../src/ip.ts
test('ipv4', convertAddr('127.0.0.1')).equal('7f000001');
test('ipv4', convertAddr('10.11.12.13')).equal('0a0b0c0d');
test('ipv4', convertAddr('255.1.3.99')).equal('ff010363');

test('ipv6 to 32 character string', convertAddr6('abcd::efff')).equal(
	'abcd000000000000000000000000efff'
);
test('ipv6 to 32 character string', convertAddr6('abcd:1234:1::efff')).equal(
	'abcd123400010000000000000000efff'
);
test(
	'ipv6 to 32 character string',
	convertAddr6('abcd:1234:1::2:127.0.0.1')
).equal('abcd123400010000000000027f000001');

test('cidr4', cidrRange('10.0.0.1/8')).equal(['0a000000', '0affffff']);
test('cidr4', cidrRange('172.16.100.64/22')).equal(['ac106400', 'ac1067ff']);

test('compare', convertAddr6('abcd:1234:1::2:127.0.0.1')).bigger(
	convertAddr6('abcd:1234:1::')
);
test('compare', convertAddr6('::')).smaller(convertAddr6('::1'));
test('compare', convertAddr6('aaab::1234')).bigger(convertAddr6('aaaa::9999'));
test('compare', convertAddr6('aaab::127.0.0.1')).equal(
	convertAddr6('aaab::7f00:1')
);
test('compare', convertAddr('aaab::127.0.0.1')).smaller(
	convertAddr('220.181.38.148')
);
