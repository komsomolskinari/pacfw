// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IPMatcherNode {
	one?: IPMatcherNode;
	zero?: IPMatcherNode;
	rule?: Rule;
}
/* Applied type (one tree per type)
 * IPv4
 * IPv6
 */
class IPMatcher {
	private data: IPMatcherNode = {};
	add(key: boolean[], value: Rule): void {
		let node = this.data;
		for (let index = 0; index < key.length; index++) {
			const element = key[index];
			if (element) {
				node.one = {};
				node = node.one;
			} else {
				node.zero = {};
				node = node.zero;
			}
		}
		node.rule = value;
	}
	/**
	 * Return all possible rules, IP uses best match
	 * @param key
	 */
	search(str: string): Rule[] {
		const ret = [];
		let node = this.data;
		const arr = ParseIP(str);
		for (let index = 0; index < arr.length; index++) {
			const element = arr[index];
			if (element) {
				node = node.one;
			} else {
				node = node.zero;
			}
			ret[0] = node.rule;
		}
		if (ret[0]) return [ret[0]];
		else return [];
	}
}
