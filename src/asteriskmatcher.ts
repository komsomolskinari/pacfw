/* Applied type ('*' included only)
 * Domain,
 * String,
 * Prefix,
 */
class AsteriskMatcher {
	private data: [string[], Rule][] = [];
	add(key: string[], value: Rule): void {
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
				let p = 0;
				for (let index = 0; index < key.length; index++) {
					const k = key[index];
					p = str.indexOf(k, p);
					if (p < 0) break;
				}
				if (p >= 0) ret.push(value);
			}
		}
		return ret;
	}
}
