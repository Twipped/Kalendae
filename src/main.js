var today, moment;

var Kalendae = function (targetElement, options) {
	if (typeof document.addEventListener !== 'function' && !util.isIE8()) return;

	//if the first argument isn't an element and isn't a string, assume that it is the options object
	var is_element = false;
	try {
		is_element = targetElement instanceof Element;
	}
	catch (err) {
		is_element = !!targetElement && is_element.nodeType === 1;
	}
	if (!(is_element || typeof(targetElement) === 'string')) options = targetElement;

	var self = this,
		classes = self.classes,
		opts = self.settings = util.merge(self.defaults, {attachTo:targetElement}, options || {}),
		$container = self.container = util.make('div', {'class':classes.container}),
		calendars = self.calendars = [],
		startDay = moment().day(opts.weekStart),
		vsd,
		columnHeaders = [],
		$cal,
		$title,
		$caption,
		$header,
		$days, $week, dayNodes = [],
		$span,
		i = 0,
		j = opts.months;

	if (util.isIE8()) util.addClassName($container, 'ie8');

	//generate the column headers (Su, Mo, Tu, etc)
	i = 7;
	while (i--) {
		columnHeaders.push( startDay.format(opts.columnHeaderFormat) );
		startDay.add('days',1);
	}

	//setup publish/subscribe and apply any subscriptions passed in settings
	MinPubSub(self);
	if (typeof opts.subscribe === 'object') {
		for (i in opts.subscribe) if (opts.subscribe.hasOwnProperty(i)) {
			self.subscribe(i, opts.subscribe[i]);
		}
	}

	//process default selected dates
	self._sel = [];
	if (!!opts.selected) self.setSelected(opts.selected, false);

	//set the view month
	if (!!opts.viewStartDate) {
		vsd = moment(opts.viewStartDate, opts.format);
	} else if (self._sel.length > 0) {
		vsd = moment(self._sel[0]);
	} else {
		vsd = moment();
	}
	self.viewStartDate = vsd.date(1);

	var viewDelta = ({
		'past'          : opts.months-1,
		'today-past'    : opts.months-1,
		'any'           : opts.months>2?Math.floor(opts.months/2):0,
		'today-future'  : 0,
		'future'        : 0
	})[this.settings.direction];


	if (viewDelta && moment().month()==moment(self.viewStartDate).month()){
		self.viewStartDate = moment(self.viewStartDate).subtract({M:viewDelta}).date(1);
	}


	if (typeof opts.blackout === 'function') {
		self.blackout = opts.blackout;
	} else if (!!opts.blackout) {
		var bdates = parseDates(opts.blackout, opts.parseSplitDelimiter, opts.format);
		self.blackout = function (input) {
			input = moment(input).startOf('day').yearDay();
			if (input < 1 || !self._sel) return false;
			var i = bdates.length;
			while (i--) if (bdates[i].startOf('day').yearDay() === input) return true;
			return false;
		};
	} else {
		self.blackout = function () {return false;};
	}


	self.direction = self.directions[opts.direction] ? self.directions[opts.direction] : self.directions['any'];


	//for the total months setting, generate N calendar views and add them to the container
	j = Math.max(opts.months,1);
	while (j--) {
		$cal = util.make('div', {'class':classes.calendar}, $container);

		$cal.setAttribute('data-cal-index', j);
		if (opts.months > 1) {
			if (j == Math.max(opts.months-1,1)) util.addClassName($cal, classes.monthFirst);
			else if (j === 0) util.addClassName($cal, classes.monthLast);
			else util.addClassName($cal, classes.monthMiddle);
		}

		//title bar
		$title = util.make('div', {'class':classes.title}, $cal);
		if(!opts.useYearNav){
			util.addClassName($title, classes.disableYearNav);
		}
		util.make('a', {'class':classes.previousYear}, $title);           //previous button
		util.make('a', {'class':classes.previousMonth}, $title);          //previous button
		util.make('a', {'class':classes.nextYear}, $title);               //next button
		util.make('a', {'class':classes.nextMonth}, $title);              //next button
		$caption = util.make('span', {'class':classes.caption}, $title);  //title caption

		//column headers
		$header = util.make('div', {'class':classes.header}, $cal);
		i = 0;
		do {
			$span = util.make('span', {}, $header);
			$span.innerHTML = columnHeaders[i];
		} while (++i < 7);

		//individual day cells
		$days = util.make('div', {'class':classes.days}, $cal);
		i = 0;
		dayNodes = [];
		do {
			if (opts.mode == 'week') {
				if ((i % 7) === 0) {
					$week = util.make('div', {'class': classes.week + ' clearfix'}, $days);
					dayNodes.push($week);
				}
				util.make('span', {}, $week);
			} else {
				dayNodes.push(util.make('span', {}, $days));
			}
		} while (++i < 42);

		//store each calendar view for easy redrawing
		calendars.push({
			caption:$caption,
			days:dayNodes
		});

		if (j) util.make('div', {'class':classes.monthSeparator}, $container);
	}

	self.draw();

	util.addEvent($container, 'mousedown', function (event, target) {
		var clickedDate;
		if (util.hasClassName(target, classes.nextMonth)) {
		//NEXT MONTH BUTTON
			if (!self.disableNext && self.publish('view-changed', self, ['next-month']) !== false) {
				self.viewStartDate.add('months',1);
				self.draw();
			}
			return false;

		} else if (util.hasClassName(target, classes.previousMonth)) {
		//PREVIOUS MONTH BUTTON
			if (!self.disablePreviousMonth && self.publish('view-changed', self, ['previous-month']) !== false) {
				self.viewStartDate.subtract('months',1);
				self.draw();
			}
			return false;

		} else if (util.hasClassName(target, classes.nextYear)) {
		//NEXT MONTH BUTTON
			if (!self.disableNext && self.publish('view-changed', self, ['next-year']) !== false) {
				self.viewStartDate.add('years',1);
				self.draw();
			}
			return false;

		} else if (util.hasClassName(target, classes.previousYear)) {
		//PREVIOUS MONTH BUTTON
			if (!self.disablePreviousMonth && self.publish('view-changed', self, ['previous-year']) !== false) {
				self.viewStartDate.subtract('years',1);
				self.draw();
			}
			return false;

		} else if ( (util.hasClassName(target.parentNode, classes.days) || util.hasClassName(target.parentNode, classes.week)) && util.hasClassName(target, classes.dayActive) && (clickedDate = target.getAttribute('data-date'))) {
		//DAY CLICK
			clickedDate = moment(clickedDate, opts.dayAttributeFormat).hours(12);
			if (self.publish('date-clicked', self, [clickedDate]) !== false) {

				switch (opts.mode) {
					case 'multiple':
						if (!self.addSelected(clickedDate)) self.removeSelected(clickedDate);
						break;
					case 'range':
						self.addSelected(clickedDate);
						break;
					case 'week':
						self.weekSelected(clickedDate);
						break;
					case 'single':
						/* falls through */
					default:
						self.addSelected(clickedDate);
						break;
				}

			}
			return false;

		} else if ( util.hasClassName(target.parentNode, classes.week) && (clickedDate = target.getAttribute('data-date') ) ) {
		//INACTIVE WEEK CLICK
			clickedDate = moment(clickedDate, opts.dayAttributeFormat).hours(12);
			if (self.publish('date-clicked', self, [clickedDate]) !== false) {
				if (opts.mode == 'week') {
					self.weekSelected(clickedDate);
				}
			}
			return false;
		}

		return false;
	});


	if (!!(opts.attachTo = util.$(opts.attachTo))) {
		opts.attachTo.appendChild($container);
	}

};

Kalendae.prototype = {
	defaults : {
		attachTo              :null,            /* the element to attach the root container to. can be string or DOMElement */
		months                :1,               /* total number of months to display side by side */
		weekStart             :0,               /* day to use for the start of the week. 0 is Sunday */
		direction             :'any',           /* past, today-past, any, today-future, future */
		directionScrolling    :true,            /* if a direction other than any is defined, prevent scrolling out of range */
		viewStartDate         :null,            /* date in the month to display.  When multiple months, this is the left most */
		blackout              :null,            /* array of dates, or function to be passed a date */
		selected              :null,            /* dates already selected.  can be string, date, or array of strings or dates. */
		mode                  :'single',        /* single, multiple, range */
		dayOutOfMonthClickable:false,
		format                :null,            /* string used for parsing dates. */
		subscribe             :null,            /* object containing events to subscribe to */

		columnHeaderFormat    :'dd',            /* number of characters to show in the column headers */
		titleFormat           :'MMMM, YYYY',    /* format mask for month titles. See momentjs.com for rules */
		dayNumberFormat       :'D',             /* format mask for individual days */
		dayAttributeFormat    :'YYYY-MM-DD',    /* format mask for the data-date attribute set on every span */
		parseSplitDelimiter   : /,\s*|\s+-\s+/, /* regex to use for splitting multiple dates from a passed string */
		rangeDelimiter        :' - ',           /* string to use between dates when outputting in range mode */
		multipleDelimiter     :', ',            /* string to use between dates when outputting in multiple mode */
		useYearNav            :true,

		dateClassMap          :{}
	},
	classes : {
		container       :'kalendae',
		calendar        :'k-calendar',
		monthFirst      :'k-first-month',
		monthMiddle     :'k-middle-month',
		monthLast       :'k-last-month',
		title           :'k-title',
		previousMonth   :'k-btn-previous-month',
		nextMonth       :'k-btn-next-month',
		previousYear    :'k-btn-previous-year',
		nextYear        :'k-btn-next-year',
		caption         :'k-caption',
		header          :'k-header',
		days            :'k-days',
		week            :'k-week',
		dayOutOfMonth   :'k-out-of-month',
		dayInMonth      :'k-in-month',
		dayActive       :'k-active',
		daySelected     :'k-selected',
		dayInRange      :'k-range',
		dayToday        :'k-today',
		monthSeparator  :'k-separator',
		disablePreviousMonth    :'k-disable-previous-month-btn',
		disableNextMonth        :'k-disable-next-month-btn',
		disablePreviousYear     :'k-disable-previous-year-btn',
		disableNextYear         :'k-disable-next-year-btn',
		disableYearNav          :'k-disable-year-nav'
	},

	disablePreviousMonth: false,
	disableNextMonth: false,
	disablePreviousYear: false,
	disableNextYear: false,

	directions: {
		'past'          :function (date) {return moment(date).startOf('day').yearDay() >= today.yearDay();},
		'today-past'    :function (date) {return moment(date).startOf('day').yearDay() > today.yearDay();},
		'any'           :function (date) {return false;},
		'today-future'  :function (date) {return moment(date).startOf('day').yearDay() < today.yearDay();},
		'future'        :function (date) {return moment(date).startOf('day').yearDay() <= today.yearDay();}
	},

	getSelectedAsDates : function () {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(this._sel[i].toDate());
		}
		return out;
	},

	getSelectedAsText : function (format) {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(this._sel[i].format(format || this.settings.format || 'YYYY-MM-DD'));
		}
		return out;
	},

	getSelectedRaw : function () {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(moment(this._sel[i]));
		}
		return out;
	},

	getSelected : function (format) {
		var sel = this.getSelectedAsText(format);
		switch (this.settings.mode) {
			case 'week':
				/* falls through range */

			case 'range':
				sel.splice(2); //shouldn't be more than two, but lets just make sure.
				return sel.join(this.settings.rangeDelimiter);

			case 'multiple':
				return sel.join(this.settings.multipleDelimiter);

			case 'single':
				/* falls through */
			default:
				return (sel[0] || null);
		}
	},

	isSelected : function (input) {
		input = moment(input).startOf('day').yearDay();
		if (input < 1 || !this._sel || this._sel.length < 1) return false;

		switch (this.settings.mode) {
			case 'week':
				/* falls through range */
			case 'range':
				var a = this._sel[0] ? this._sel[0].startOf('day').yearDay() : 0,
					b = this._sel[1] ? this._sel[1].startOf('day').yearDay() : 0;

				if (a === input || b === input) return 1;
				if (!a || !b) return 0;

				if ((input > a && input < b) || (a<b && input < a && input > b))  return -1;
				return false;

			case 'multiple':
				var i = this._sel.length;
				while (i--) {
					if (this._sel[i].startOf('day').yearDay() === input) {
						return true;
					}
				}
				return false;


			case 'single':
				/* falls through */
			default:
				return (this._sel[0] && (this._sel[0].startOf('day').yearDay() === input));
		}

		return false;
	},

	setSelected : function (input, draw) {
		var i,
			new_dates = parseDates(input, this.settings.parseSplitDelimiter, this.settings.format),
			old_dates = parseDates(this.getSelected(), this.settings.parseSplitDelimiter, this.settings.format);

		i = old_dates.length;
		while(i--) { this.removeSelected(old_dates[i], false); }

		i = new_dates.length;
		while(i--) { this.addSelected(new_dates[i], false); }

		if (draw !== false) {
			if (new_dates[0]) {
				this.viewStartDate = moment(new_dates[0], this.settings.format);
			}
			this.draw();
		}
	},

	addSelected : function (date, draw) {
		date = moment(date, this.settings.format).hours(12);

		if(this.settings.dayOutOfMonthClickable && this.settings.mode !== 'range'){ this.makeSelectedDateVisible(date); }

		switch (this.settings.mode) {
			case 'multiple':
				if (!this.isSelected(date)) this._sel.push(date);
				else return false;
				break;
			case 'range':

				if (this._sel.length !== 1) this._sel = [date];
				else {
					if (date.startOf('day').yearDay() > this._sel[0].startOf('day').yearDay()) this._sel[1] = date;
					else this._sel = [date, this._sel[0]];
				}
				break;
			case 'single':
				/* falls through */
			default:
				this._sel = [date];
				break;
		}
		this._sel.sort(function (a,b) {return a.startOf('day').yearDay() - b.startOf('day').yearDay();});
		this.publish('change', this, [date]);
		if (draw !== false) this.draw();
		return true;
	},

	weekSelected: function (mom) {
		var x = mom.toDate();
		var start = moment(x).startOf('week');
		var end = moment(x).endOf('week').subtract('day',1);
		this._sel = [start, end];
		this.publish('change', this, [mom.day()]);
		this.draw();
	},

	makeSelectedDateVisible: function (date) {
		outOfViewMonth = moment(date).date('1').diff(this.viewStartDate,'months');

		if(outOfViewMonth < 0){
			this.viewStartDate.subtract('months',1);
		}
		else if(outOfViewMonth > 0 && outOfViewMonth >= this.settings.months){
			this.viewStartDate.add('months',1);
		}
	},

	removeSelected : function (date, draw) {
		date = moment(date, this.settings.format).hours(12);
		var i = this._sel.length;
		while (i--) {
			if (this._sel[i].startOf('day').yearDay() === date.startOf('day').yearDay()) {
				this._sel.splice(i,1);
				this.publish('change', this, [date]);
				if (draw !== false) this.draw();
				return true;
			}
		}
		return false;
	},

	draw : function draw() {
		// return;
		var month = moment(this.viewStartDate).startOf('day').hours(12), //force middle of the day to avoid any weird date shifts
			day,
			classes = this.classes,
			cal,
			$span,
			klass,
			i=0, c,
			j=0, k,
			w,
			s,
			dateString,
			opts = this.settings,
			diff;

		c = this.calendars.length;

		do {
			day = moment(month).date(1);
			day.day( day.day() < this.settings.weekStart ? this.settings.weekStart-7 : this.settings.weekStart);
			//if the first day of the month is less than our week start, back up a week

			cal = this.calendars[i];
			cal.caption.innerHTML = month.format(this.settings.titleFormat);
			j = 0;
			w = 0;
			do {
				if (opts.mode == 'week') {
					if (((j % 7) === 0) && (j !== 0)) {
						w++;
					}
					$span = cal.days[w].childNodes[j%7];
				} else {
					$span = cal.days[j];
				}

				klass = [];

				s = this.isSelected(day);

				if (s) klass.push(({'-1':classes.dayInRange,'1':classes.daySelected, 'true':classes.daySelected})[s]);

				if (day.month() != month.month()) klass.push(classes.dayOutOfMonth);
				else klass.push(classes.dayInMonth);

				if (!(this.blackout(day) || this.direction(day) || (day.month() != month.month() && opts.dayOutOfMonthClickable === false)) || s>0) klass.push(classes.dayActive);

				if (day.startOf('day').yearDay() === today.yearDay()) klass.push(classes.dayToday);

				dateString = day.format(this.settings.dayAttributeFormat);
				if (opts.dateClassMap[dateString]) klass.push(opts.dateClassMap[dateString]);

				$span.innerHTML = day.format(opts.dayNumberFormat);
				$span.className = klass.join(' ');
				$span.setAttribute('data-date', dateString);


				day.add('days',1);
			} while (++j < 42);
			month.add('months',1);
		} while (++i < c);

		if (opts.directionScrolling) {
			var diffComparison = moment().startOf('day').hours(12);
			diff = month.diff(diffComparison, 'months', true);

			if (opts.direction === 'today-past' || opts.direction === 'past') {
				if (diff <= 0) {
					this.disableNextMonth = false;
					util.removeClassName(this.container, classes.disableNextMonth);
				} else {
					this.disableNextMonth = true;
					util.addClassName(this.container, classes.disableNextMonth);
				}
			} else if (opts.direction === 'today-future' || opts.direction === 'future') {
				if (diff > opts.months) {
					this.disablePreviousMonth = false;
					util.removeClassName(this.container, classes.disablePreviousMonth);
				} else {
					this.disablePreviousMonth = true;
					util.addClassName(this.container, classes.disablePreviousMonth);
				}
			}

			if (opts.direction === 'today-past' || opts.direction === 'past') {
				if (diff <= -11) {
					this.disableNextYear = false;
					util.removeClassName(this.container, classes.disableNextYear);
				} else {
					this.disableNextYear = true;
					util.addClassName(this.container, classes.disableNextYear);
				}
			} else if (opts.direction==='today-future' || opts.direction==='future') {
				if (diff > (11 + opts.months)) {
					this.disablePreviousYear = false;
					util.removeClassName(this.container, classes.disablePreviousYear);
				} else {
					this.disablePreviousYear = true;
					util.addClassName(this.container, classes.disablePreviousYear);
				}
			}
		}
	}
};

var parseDates = function (input, delimiter, format) {
	var output = [];

	if (typeof input === 'string') {
		input = input.split(delimiter);
	} else if (!util.isArray(input)) {
		input = [input];
	}

	var c = input.length,
		i = 0,
		m;

	do {
		if (input[i]) {
			m = moment(input[i], format).hours(12);
			if (m.isValid()) output.push(m);
		}
	} while (++i < c);

	return output;
};



window.Kalendae = Kalendae;
