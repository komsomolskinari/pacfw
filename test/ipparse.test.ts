/// ../src/ipparse.ts

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
