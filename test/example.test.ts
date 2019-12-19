/// ./src/_99999_test.ts
// this is source to load
test('1+2', t(1, 2)).equal(3);
test('framework1', {
	a: [1, 2, 3],
	b: 'aaaa',
	c: 0
}).equal({
	a: [1, 2, 3],
	b: 'aaa'
});
test('framework2', {
	a: [1, 2, 3],
	b: 'aaaa'
}).equal({
	a: [1, 2, 3],
	b: 'aaaa'
});
test('framework3', 1).truthy();
