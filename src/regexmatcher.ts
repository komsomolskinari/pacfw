/* Applied type
 * Regexp
 */
class RegexMatcher {
	private data: [RegExp, Rule][] = [];
	add(key: RegExp, value: Rule): void {
		this.data.push([key, value]);
	}
	/**
	 * Return all possible rules
	 * @param key
	 */
	search(str: string): Rule[] {
		const ret = [];
		for (const k in this.data) {
			if (this.data.hasOwnProperty(k)) {
				const [key, value] = this.data[k];
				if (str.match(key) !== null) ret.push(value);
			}
		}
		return ret;
	}
}
