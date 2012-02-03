
var util = {
	isIE : /msie/.test(navigator.userAgent.toLowerCase()),

// ELEMENT FUNCTIONS

	$: function (elem) {
		return (typeof elem == 'string') ? document.getElementById(elem) : elem;
	},
	
	make: function (tagName, attributes) {
		var k, e = document.createElement(tagName);
		if (!!attributes) for (k in attributes) if (attributes.hasOwnProperty(k)) e.setAttribute(k, attributes[k]);
		return e;
	},

	// Returns true if the DOM element is visible, false if it's hidden.
	// Checks if display is anything other than none.
	isVisible: function (elem) {
		// shamelessly copied from jQuery
		return elem.offsetWidth > 0 || elem.offsetHeight > 0;
	},

	// Adds a listener callback to a DOM element which is fired on a specified
	// event.  Callback is sent the event object and the element that triggered the event
	addEvent: function (elem, event, callback) {
		var listener = function (event) {
			event = event || window.event;
			var target = event.target || event.srcElement; 
			return callback.apply(elem, [event, target]);
		};
		if (elem.attachEvent) { // IE only.  The "on" is mandatory.
			elem.attachEvent("on" + event, listener);
		} else { // Other browsers.
			elem.addEventListener(event, listener, false);
		}
		return listener;
	},

	// Removes a listener callback from a DOM element which is fired on a specified
	// event.
	removeEvent: function (elem, event, listener) {
		if (elem.detachEvent) {	// IE only.  The "on" is mandatory.
			elem.detachEvent("on" + event, listener);
		} else { // Other browsers.
			elem.removeEventListener(event, listener, false);
		}
	},
	
	hasClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return false;
		var eClassName = elem.className;
		return (eClassName.length > 0 && (eClassName == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(eClassName)));
	},

	addClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return;
		if (!util.hasClassName(elem, className)) elem.className += (elem.className ? ' ' : '') + className;
	},

	removeClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return;
		elem.className = util.trimString(elem.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
	},

	getTop: function (elem, isInner) {
		var result = elem.offsetTop;
		if (!isInner) {
			while ((elem = elem.offsetParent)) {
				result += elem.offsetTop;
			}
		}
		return result;
	},

	getHeight: function (elem) {
		return elem.offsetHeight || elem.scrollHeight;
	},

	getWidth: function (elem) {
		return elem.offsetWidth || elem.scrollWidth;
	},
	
	
// TEXT FUNCTIONS	
	
	trimString: function (input) {
		return input.replace(/^\s+/, '').replace(/\s+$/, '');
	},
	
	
// OBJECT FUNCTIONS

	merge: function () {
		/* Combines multiple objects into one.
		 * Syntax: util.extend([true], object1, object2, ... objectN)
		 * If first argument is true, function will merge recursively.
		 */
		
		var deep = (arguments[0]===true),
			d = {},
			i = deep?1:0;

		var _c = function _c(a, b) {
			if (typeof b !== 'object') return a;
			for (var k in b) if (b.hasOwnProperty(k)) {
				//if property is an object or array, merge the contents instead of overwriting, if extend() was called as such
				if (deep && typeof a[k] === 'object' && typeof b[k] === 'object') _update(a[k], b[k]);
				else a[k] = b[k];
			}
			return a;
		}

		for (; i < arguments.length; i++) {
			_c(d, arguments[i]);
		}
		return d;
	},
	
	isArray: function (array) {
		return !(
			!array || 
			(!array.length || array.length === 0) || 
			typeof array !== 'object' || 
			!array.constructor || 
			array.nodeType || 
			array.item 
		);
	}
};
