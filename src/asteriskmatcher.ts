/// ./rule.ts
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
				const [sections, rule] = this.data[k];
				let p = 0;
				// foreach section
				for (let index = 0; index < sections.length; index++) {
					const k = sections[index];
					// match a section
					p = str.indexOf(k, p);
					if (p < 0) break;
				}
				// sucess only all section sucess
				if (p >= 0) ret.push(rule);
			}
		}
		return ret;
	}
}
