/* eslint-disable */
/*
 * Copy paste from MDN
 */
function polyfill() {
	if (!Array.prototype.map) {
		Array.prototype.map = function(callback /*, thisArg*/) {
			let T, k;

			if (this == null) {
				throw new TypeError('this is null or not defined');
			}
			const O = Object(this);
			const len = O.length >>> 0;
			if (typeof callback !== 'function') {
				throw new TypeError(callback + ' is not a function');
			}
			if (arguments.length > 1) {
				T = arguments[1];
			}
			const A = new Array(len);
			k = 0;
			while (k < len) {
				let kValue, mappedValue;
				if (k in O) {
					kValue = O[k];
					mappedValue = callback.call(T, kValue, k, O);
					A[k] = mappedValue;
				}
				k++;
			}
			return A;
		};
	}
	if (!Array.prototype.filter) {
		Array.prototype.filter = function(func: any, thisArg: any) {
			'use strict';
			if (!(typeof func === 'function' && this)) throw new TypeError();

			const len = this.length >>> 0,
				res = new Array(len), // preallocate array
				t = this;
			let c = 0,
				i = -1;
			if (thisArg === undefined) {
				while (++i !== len) {
					// checks to see if the key was set
					if (i in this) {
						if (func(t[i], i, t)) {
							res[c++] = t[i];
						}
					}
				}
			} else {
				while (++i !== len) {
					// checks to see if the key was set
					if (i in this) {
						if (func.call(thisArg, t[i], i, t)) {
							res[c++] = t[i];
						}
					}
				}
			}

			res.length = c; // shrink down array to proper size
			return res;
		};
	}
	if (!Object.keys) {
		Object.keys = (function() {
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
		Object['values'] = (o: any) => Object.keys(o).map(k => o[k]);
}
function log(s: any) {
	if (typeof WScript !== "undefined") WScript.Echo(s);
	//else if (typeof alert !== "undefined") alert(s);
	else console.log(s);
}
