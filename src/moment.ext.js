
if (!Kalendae.moment) {
	if (window.moment) {
		Kalendae.moment = window.moment;
	} else {
		throw "Kalendae requires moment.js. You must use kalendae.standalone.js if moment is not available on the page.";
	}
}

moment = Kalendae.moment;

//function to get the total number of days since the epoch.
moment.fn.yearDay = function (input) {
	var yearday = Math.floor(this._d / 86400000);
    return (typeof input === 'undefined') ? yearday :
        this.add({ d : input - yearday });
};

today = Kalendae.moment().startOf('day');
