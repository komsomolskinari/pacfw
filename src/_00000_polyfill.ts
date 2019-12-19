/* eslint-disable */
/*
 * Copy paste from MDN
 */
function polyfill() {
	if (!Object.keys) {
		Object.keys = (() => {
			const hasOwnProperty = Object.prototype.hasOwnProperty,
				hasDontEnumBug = !{ toString: null }.propertyIsEnumerable(
					'toString'
				),
				dontEnums = [
					'toString',
					'toLocaleString',
					'valueOf',
					'hasOwnProperty',
					'isPrototypeOf',
					'propertyIsEnumerable',
					'constructor'
				],
				dontEnumsLength = dontEnums.length;

			return function(obj: any) {
				if (
					(typeof obj !== 'object' && typeof obj !== 'function') ||
					obj === null
				)
					throw new TypeError('Object.keys called on non-object');

				const result = [];

				for (const prop in obj) {
					if (hasOwnProperty.call(obj, prop)) result.push(prop);
				}

				if (hasDontEnumBug) {
					for (let i = 0; i < dontEnumsLength; i++) {
						if (hasOwnProperty.call(obj, dontEnums[i]))
							result.push(dontEnums[i]);
					}
				}
				return result;
			};
		})();
	}
	if (!Object['values'])
		Object['values'] = (o: any) => {
			const keys = Object.keys(o);
			const ret = [];
			for (const iterator of keys) {
				ret.push(o[iterator]);
			}
			return ret;
		};
}
function log(s: any) {
	if (typeof WScript !== 'undefined') WScript.Echo(s);
	//else if (typeof alert !== "undefined") alert(s);
	else console.log(s);
}
