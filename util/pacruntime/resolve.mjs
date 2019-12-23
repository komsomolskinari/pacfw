import * as dns from 'dns';

async function main(args) {
	const name = args[0] || 'www.baidu.com';
	const qtype = args[1] || 'a';
	const all = args[2] != undefined;
	try {
		const result = await dns.promises.resolve(name, qtype.toUpperCase());
		if (result.length === 0) return;
		if (all) {
			result.forEach(r => console.log(r));
		} else console.log(result[0]);
	} catch {
		return;
	}
}

main(process.argv.slice(2));
