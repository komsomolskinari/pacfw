/// ./rule.ts,./ipmatcher.ts,./regexmatcher.ts,./stringmatcher.ts,./asteriskmatcher.ts
class CombinedMatcher {
	ip4m = new IPMatcher();
	ip6m = new IPMatcher();
	stringm = new StringMatcher();
	asteriskm = new AsteriskMatcher();
	regexm = new RegexMatcher();

	add(ruletxt: string): void {
		const rule = ParseRule(ruletxt);
		switch (rule.type) {
			case RuleType.IPv4:
				this.ip4m.add(rule.matcher as boolean[], rule);
				break;
			case RuleType.IPv6:
				this.ip6m.add(rule.matcher as boolean[], rule);
				break;
			case RuleType.Regexp:
				this.regexm.add(rule.matcher as RegExp, rule);
				break;
			case RuleType.Domain:
			case RuleType.Prefix:
			case RuleType.String:
				if (typeof rule.matcher !== 'string')
					this.asteriskm.add(rule.matcher as string[], rule);
				else {
					this.stringm.add(rule.matcher as string, rule);
				}
				break;
		}
	}

	search(str: string): Rule[] {
		const isName = ParseIP(str) === undefined;
		if (isName) {
			// dns resolve
		}
		return [
			...this.ip4m.search(str),
			...this.ip6m.search(str),
			...this.stringm.search(str),
			...this.asteriskm.search(str),
			...this.regexm.search(str)
		];
	}
}
