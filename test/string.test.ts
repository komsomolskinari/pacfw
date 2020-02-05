/// ../src/index.ts
SetEnv(['tank'], []);
test('string in host', FindProxyForURL('http://tank.com', 'tank.com')).equal(
	__PROXY__
);
test(
	'string in url',
	FindProxyForURL('http://example.com/tank', 'example.com')
).equal(__PROXY__);

log(parseGFWList(['tank']));
