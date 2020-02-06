function convertAddr4(ip4: string): number {
	// eslint-disable-next-line @typescript-eslint/camelcase
	if (typeof convert_addr == 'function') return convert_addr(ip4);
	const m = ip4.split('.');
	const ipnum =
		(parseInt(m[0], 10) << 16) * 256 +
		(parseInt(m[1], 10) << 16) +
		(parseInt(m[2], 10) << 8) +
		parseInt(m[3], 10);
	return ipnum;
}

// output ipv6 address in all lowercase hex format
function convertAddr6(ip6: string): string {
	return '00000000000000000000000000000000';
}
