function IPv4toInt(ip: string): number {
	const ipnums = [0, 0, 0, 0];
	const iparray = ip.split('.');
	let ipint = 0;
	for (let index = 0; index < iparray.length - 1; index++) {
		ipnums[index] = parseInt(iparray[index]);
	}
	ipnums[3] = parseInt(iparray[iparray.length - 1]);
	if (iparray.length === 1 && ipnums[0] >= 256) ipint = ipnums[0];
	else {
		ipint =
			256 * 256 * 256 * ipnums[0] +
			256 * 256 * ipnums[1] +
			256 * ipnums[2] +
			ipnums[3];
	}
	if (isNaN(ipint)) return undefined;
	return ipint;
}
function IPv6toInt(ip: string): [number, number, number, number] {
	const ipstr = ip.split(':');
	if (ipstr.length < 2) return undefined;
	const head = [];
	const tail = [];
	const mappedv4 = ipstr[ipstr.length - 1].indexOf('.') >= 0;
	let inhead = true;
	for (let index = 0; index < ipstr.length; index++) {
		const element = ipstr[index];
		if (element.length === 0) {
			inhead = false;
			continue;
		}
		if (element.length > 4 && element.indexOf('.') < 0) return undefined;
		if (inhead) head.push(element);
		else tail.push(element);
	}
	// replace last 32 bit with 0
	if (mappedv4) {
		tail.pop();
		tail.push('0', '0');
	}
	const ipint16 = [0, 0, 0, 0, 0, 0, 0, 0];
	for (let index = 0; index < head.length; index++) {
		const element = head[index];
		ipint16[index] = parseInt('0x' + element);
	}
	for (let index = tail.length - 1, ptr = 7; index >= 0; index--, ptr--) {
		const element = tail[index];
		ipint16[ptr] = parseInt('0x' + element);
	}
	function i16i32(i1: number, i2: number): number {
		return 65536 * i1 + i2;
	}
	const ipints: [number, number, number, number] = [
		i16i32(ipint16[0], ipint16[1]),
		i16i32(ipint16[2], ipint16[3]),
		i16i32(ipint16[4], ipint16[5]),
		i16i32(ipint16[6], ipint16[7])
	];
	if (mappedv4) ipints[3] = IPv4toInt(ipstr[ipstr.length - 1]);
	if (
		!isFinite(ipints[0]) ||
		!isFinite(ipints[1]) ||
		!isFinite(ipints[2]) ||
		!isFinite(ipints[3])
	)
		return undefined;
	else return ipints;
}
function Int32toBoolArray(int: number): boolean[] {
	const ret = [];
	for (let mask = 0x80000000, ctr = 0; ctr < 32; ctr++, mask >>>= 1) {
		ret.push((int & mask) !== 0 ? true : false);
	}
	return ret;
}

function ParseIPv4(ip: string, len = 0): boolean[] {
	if (len === 0) len = 32;
	const ipint = IPv4toInt(ip);
	if (ipint === undefined) return undefined;
	return Int32toBoolArray(ipint).slice(0, len);
}
function ParseIPv6(ip: string, len = 0): boolean[] {
	if (len === 0) len = 128;
	const bin = [];
	const int = IPv6toInt(ip);
	if (int === undefined) return undefined;
	for (let index = 0; index < int.length; index++) {
		const element = Int32toBoolArray(int[index]);
		bin.push(...element);
	}
	return bin.slice(0, len);
}
function ParseIP(ip: string, len = 0, v4?: boolean): boolean[] {
	if (v4 === undefined) {
		const p4 = ParseIPv4(ip, len);
		const p6 = ParseIPv6(ip, len);
		return p4 ?? p6;
	}
	return v4 ? ParseIPv4(ip, len) : ParseIPv6(ip, len);
}
