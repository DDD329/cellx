(function(undefined) {
	'use strict';

	var hasOwn = Object.prototype.hasOwnProperty;
	var toString = Object.prototype.toString;
	var push = Array.prototype.push;
	var slice = Array.prototype.slice;
	var splice = Array.prototype.splice;

	var global = Function('return this;')();

	var invokeCell;

	/**
	 * @typesign (value?, opts?: {
	 *     get?: (value): *,
	 *     validate?: (value),
	 *     computed?: false
	 * }): cellx;
	 *
	 * @typesign (formula: (): *, opts?: {
	 *     get?: (value): *,
	 *     set?: (value),
	 *     validate?: (value),
	 *     computed?: true
	 * }): cellx;
	 */
	function cellx(value, opts) {
		if (!opts) {
			opts = {};
		}

		var initialValue = value;

		function cell(value) {
			return invokeCell(cell, initialValue, opts, this, value, slice.call(arguments, 1), arguments.length);
		}
		cell.constructor = cellx;

		return cell;
	}
	cellx.cellx = cellx;

	var KEY_CELLS = '__cellx_cells__';
	if (global.Symbol && typeof Symbol.iterator == 'symbol') {
		KEY_CELLS = Symbol(KEY_CELLS);
	}

	cellx.KEY_CELLS = KEY_CELLS;

	var uidCounter = 0;

	/**
	 * @typesign (target: Object, source: Object): Object;
	 */
	function mixin(target, source) {
		var names = Object.getOwnPropertyNames(source);

		for (var i = names.length; i;) {
			Object.defineProperty(target, names[--i], Object.getOwnPropertyDescriptor(source, names[i]));
		}

		return target;
	}

	/**
	 * @typesign (a, b): boolean;
	 */
	var is = Object.is || function(a, b) {
		if (a === 0 && b === 0) {
			return 1 / a == 1 / b;
		}
		return a === b || (a != a && b != b);
	};

	/**
	 * @typesign (value): boolean;
	 */
	var isArray = Array.isArray || function(value) {
		return toString.call(value) == '[object Array]';
	};

	/**
	 * @typesign (description: {
	 *     Extends: Function,
	 *     Implements?: Array<Function>,
	 *     Static?: Object,
	 *     constructor?: Function
	 * }): Function;
	 */
	function createClass(description) {
		var parent;

		if (description.Extends) {
			parent = description.Extends;
			delete description.Extends;
		} else {
			parent = Object;
		}

		var constr;

		if (hasOwn.call(description, 'constructor')) {
			constr = description.constructor;
			delete description.constructor;
		} else {
			constr = function() {};
		}

		if (description.Static) {
			mixin(constr, description.Static);
			delete description.Static;
		}

		var proto = constr.prototype = Object.create(parent.prototype);

		if (description.Implements) {
			description.Implements.forEach(function(impl) {
				mixin(proto, impl.prototype);
			});

			delete description.Implements;
		}

		mixin(proto, description);

		proto.constructor = constr;

		return constr;
	}

	/**
	 * @typesign (err);
	 */
	var logError;

	if (global.console) {
		if (console.error) {
			logError = function(err) {
				console.error(err === Object(err) && err.stack || err);
			};
		} else {
			logError = function(err) {
				console.log('Error: ' + (err === Object(err) && err.stack || err));
			};
		}
	} else {
		logError = function() {};
	}

	/**
	 * For override:
	 * @example
	 * var cellx = require('cellx');
	 * var winston = require('winston');
	 *
	 * cellx._logError = function(err) {
	 *     winston.log('error', err.message + ' ' + err.stack);
	 * };
	 */
	cellx._logError = logError;

	// gulp-include
	//= include ./Map.js
	//= include ./nextTick.js
	//= include ./EventEmitter.js
	//= include ./ObservableCollection.js
	//= include ./ObservableMap.js
	//= include ./ObservableList.js
	//= include ./Cell.js
	//= include ./invokeCell.js
	//= include ./d.js

	if (typeof exports == 'object') {
		if (typeof module == 'object') {
			module.exports = cellx;
		} else {
			exports.cellx = cellx;
		}
	} else {
		global.cellx = cellx;
	}
})();
