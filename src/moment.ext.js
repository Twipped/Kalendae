
//function to reset the date object to 00:00 GMT
Kalendae.moment.fn.stripTime = function () {
	this._d = new Date(Math.floor(this._d.valueOf() / 86400000) * 86400000);
	return this;
};


//function to get the total number of days since the epoch.
Kalendae.moment.fn.yearDay = function (input) {
	var yearday = Math.floor(this._d / 86400000);
    return (typeof input === 'undefined') ? yearday :
        this.add({ d : input - yearday });
};

today = Kalendae.moment().stripTime();
