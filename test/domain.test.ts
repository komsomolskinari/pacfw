/// ../src/index.ts
SetEnv(['||api.ai'], []);
test('api.ai', FindProxyForURL('http://api.ai', 'api.ai')).equal(__PROXY__);
test(
	'api.ai all url part',
	FindProxyForURL('http://user:passwd@api.ai:12345/path/?query=1', 'api.ai')
).equal(__PROXY__);
test(
	'api.aixcoder.com',
	FindProxyForURL('http://api.aixcoder.com', 'api.aixcoder.com')
).equal(__DIRECT__);
test(
	'api.aixcoder.com/api.ai',
	FindProxyForURL('http://api.aixcoder.com/api.ai', 'api.aixcoder.com')
).equal(__DIRECT__);
