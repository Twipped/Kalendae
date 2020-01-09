if (typeof moment !== 'undefined') {
	Kalendae.moment = moment;
}

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
	var utcDate = Date.UTC(this._d.getFullYear(), this._d.getMonth(), this._d.getDate());
	var yearday = Math.floor(utcDate / 86400000);
    return (typeof input === 'undefined') ? yearday :
        this.add({ d : input - yearday });
};
