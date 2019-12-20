/* Applied type
 * Domain,
 * String,
 * Prefix,
 */
class StringMatcher {
	private data: [string, Rule][] = [];
	add(key: string, value: Rule): void {
		this.data.push([key, value]);
	}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	prepare(): void {}
	/**
	 * Return all possible rules
	 * @param key
	 */
	search(str: string): Rule[] {
		const ret = [];
		for (const k in this.data) {
			if (this.data.hasOwnProperty(k)) {
				const [key, value] = this.data[k];
				if (str.indexOf(key) >= 0) ret.push(value);
			}
		}
		return ret;
	}
}
