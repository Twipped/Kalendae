(function (factory) {
   if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['moment'], factory);
    } else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory(require('moment'));
    } else {
        // Browser globals
        window.Kalendae = factory();
    }
} (function (moment) {
