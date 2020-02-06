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
