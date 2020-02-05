/// ../src/index.ts
const proxy = 'PROXY 127.0.0.1';
const direct = 'DIRECT';
test(
	'api.ai',
	(() => {
		SetEnv(['||api.ai'], [], proxy);
		return FindProxyForURL('http://api.ai', 'api.ai');
	})()
).equal(proxy);
test(
	'api.aixcoder.com',
	(() => {
		SetEnv(['||api.ai'], [], proxy);
		return FindProxyForURL('http://api.aixcoder.com', 'api.aixcoder.com');
	})()
).equal(direct);
