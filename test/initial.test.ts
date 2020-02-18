/// ../src/index.ts
SetEnv(['|http://baidu.com/'], []);
test('https', FindProxyForURL('https://baidu.com/', 'baidu.com')).equal(
	'DIRECT'
);
test(
	'http with path',
	FindProxyForURL('http://baidu.com/baidu/?q=google', 'baidu.com')
).equal(__PROXY__);
