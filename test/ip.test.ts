///../src/ip.ts
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

test('cidr6', cidr6Range('abcd:aaaa::1234:5678/24')).equal([
	'abcdaa00000000000000000000000000',
	'abcdaaffffffffffffffffffffffffff'
]);
test('cidr6', cidr6Range('abcd:aaaa::1234:5678/25')).equal([
	'abcdaa80000000000000000000000000',
	'abcdaaffffffffffffffffffffffffff'
]);

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
