/**
 * ═══════════════════════════════════════════════════════════
 *   PEDZ — Common Classes & Helper Functions
 * ═══════════════════════════════════════════════════════════
 */

if (typeof window.lang === 'undefined') {
    window.lang = {
        convert: function (str) { return str; }
    };
}

var MSEC_PER_MONTH = 2628000000;
var MSEC_PER_DAY = 86400000;
var MSEC_PER_HOUR = 3600000;
var MSEC_PER_YEAR = 31536000000;

function resultStringWithRef(a, b) {
    this.resultString = a;
    this.refName = b;
}

function formatPercentile(a) {
    var b;
    a = a * 100;
    if (a >= 99.5) {
        b = ">99";
    } else {
        if (a < 0.5) {
            b = "<1";
        } else {
            b = a.toFixed(0);
        }
    }
    return b;
}

function LMSClass() {
    this.hidePercentile = false;
    this.init = function() {
        this.errorCondition = [];
        this.errorString = [];
    };
    this.getRefString = function() {
        return this.refString;
    };
    this.getInfo = function(c) {
        var a = "";
        for (var b = 0; b < c.length; b++) {
            a += "<p>" + c[b] + "</p>";
        }
        return a;
    };
    this.getErrorNotes = function() {
        var a, b;
        a = "";
        for (b = 0; b < this.errorCondition.length; b++) {
            if (this.errorCondition[b]) {
                a = a + "<li>" + this.errorString[b] + "</li>";
            }
        }
        if (a != "") {
            a = "<ul>" + a + "</ul>";
        }
        return a;
    };
    this.getLowerAndUpperValues = function() {
        if (this.male) {
            this.lArray = this.lArrayMale;
            this.mArray = this.mArrayMale;
            this.sArray = this.sArrayMale;
        } else {
            this.lArray = this.lArrayFemale;
            this.mArray = this.mArrayFemale;
            this.sArray = this.sArrayFemale;
        }
        if ((this.age < this.ageArray[0]) || (this.age > this.ageArray[this.ageArray.length - 1])) {
            return -100;
        }
        var i;
        var upperIndex, lowerIndex;
        for (i = 0; i < this.ageArray.length; i++) {
            if (this.ageArray[i] == this.age) {
                upperIndex = i;
                lowerIndex = i;
                break;
            } else {
                if (this.ageArray[i] > this.age) {
                    upperIndex = i;
                    lowerIndex = --i;
                    break;
                }
            }
        }
        if (i === this.ageArray.length) {
            return -100;
        }
        if (this.age == this.ageArray[lowerIndex]) {
            this.ratio = 0;
        } else {
            this.ratio = (this.age - this.ageArray[lowerIndex]) / (this.ageArray[upperIndex] - this.ageArray[lowerIndex]);
        }
        this.lLower = this.lArray[lowerIndex];
        this.lUpper = this.lArray[upperIndex];
        this.mLower = this.mArray[lowerIndex];
        this.mUpper = this.mArray[upperIndex];
        this.sLower = this.sArray[lowerIndex];
        this.sUpper = this.sArray[upperIndex];
    };
    this.getZFromValue = function(c) {
        var d, b, a;
        if (typeof (this.lLower) == "undefined" || typeof (this.mLower) == "undefined" || typeof (this.sLower) == "undefined" || typeof (this.lUpper) == "undefined" || typeof (this.mUpper) == "undefined" || typeof (this.sUpper) == "undefined" || typeof (this.value) == "undefined" || (c === -1)) {
            return -100;
        }
        d = get_z_from_lms(c, this.lLower, this.mLower, this.sLower);
        b = get_z_from_lms(c, this.lUpper, this.mUpper, this.sUpper);
        a = d + (this.ratio * (b - d));
        return a;
    };
    this.getValueFromZ = function(c) {
        var d, b, a;
        if (typeof (this.lLower) == "undefined" || typeof (this.mLower) == "undefined" || typeof (this.sLower) == "undefined" || typeof (this.lUpper) == "undefined" || typeof (this.mUpper) == "undefined" || typeof (this.sUpper) == "undefined" || typeof (this.value) == "undefined" || (c === -1)) {
            return -100;
        }
        d = get_value_from_lms(c, this.lLower, this.mLower, this.sLower);
        b = get_value_from_lms(c, this.lUpper, this.mUpper, this.sUpper);
        a = d + (this.ratio * (b - d));
        return a;
    };
}

function MeanSdClass() {
    this.uln = 0;
    this.lln = 0;
    this.setLimitsOfNormal = function(b, a) {
        this.uln = a;
        this.lln = b;
    };
    this.getValueFromZ = function(a) {
        if ((this.mean == undefined) || (this.sd == undefined) || (a == undefined)) {
            return -100;
        }
        return this.mean + (a * this.sd);
    };
    this.getZFromValue = function(a) {
        if ((this.mean == undefined) || (this.sd == undefined) || (a <= 0)) {
            return -100;
        }
        return (a - this.mean) / this.sd;
    };
}
MeanSdClass.prototype = new LMSClass();

function MeanSDCoefficientClass() {
    this.getZFromValue = function(c) {
        if ((this.coefficients.length == 6) && (this.bsa > 0) && (c > 0)) {
            var b = this.coefficients[0] + this.coefficients[1] * this.bsa + this.coefficients[2] * Math.pow(this.bsa, 2) + this.coefficients[3] * Math.pow(this.bsa, 3);
            var a = (Math.log(c / 10) - b) / Math.sqrt(this.coefficients[4]);
            return a;
        } else {
            return -100;
        }
    };
    this.getValueFromZ = function(c) {
        if ((this.coefficients.length == 6) && (this.bsa > 0)) {
            var b = this.coefficients[0] + this.coefficients[1] * this.bsa + this.coefficients[2] * Math.pow(this.bsa, 2) + this.coefficients[3] * Math.pow(this.bsa, 3);
            var a = Math.exp((c * Math.sqrt(this.coefficients[4])) + b);
            a *= 10;
            return a;
        } else {
            return -100;
        }
    };
}
MeanSDCoefficientClass.prototype = new LMSClass();

function MeanSdInterpolatedClass() {
    this.meanUpper = -1;
    this.meanLower = -1;
    this.getLowerAndUpperValues = function() {
        var a, b, c;
        if ((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1])) {
            return -100;
        }
        for (a = 0; a < this.grid.length; a++) {
            if (this.grid[a] == this.corValue) {
                b = a;
                c = a;
                break;
            } else {
                if (this.grid[a] > this.corValue) {
                    b = a;
                    c = --a;
                    break;
                }
            }
        }
        if (a === this.grid.length) {
            return -100;
        }
        if (this.corValue == this.grid[c]) {
            this.ratio = 0;
        } else {
            this.ratio = (this.corValue - this.grid[c]) / (this.grid[b] - this.grid[c]);
        }
        this.meanLower = this.meanArray[c];
        this.meanUpper = this.meanArray[b];
        this.sdLower = this.sdArray[c];
        this.sdUpper = this.sdArray[b];
    };
    this.getValueFromZ = function(b) {
        var a, c;
        if ((this.meanUpper > 0) && (this.meanLower > 0) && (this.sdUpper > 0) && (this.sdLower > 0) && (this.ratio >= 0)) {
            a = this.meanUpper + (b * this.sdUpper);
            c = this.meanLower + (b * this.sdLower);
            return c + (this.ratio * (a - c));
        } else {
            return -100;
        }
    };
    this.getZFromValue = function(b) {
        var a, c;
        if ((this.meanUpper > 0) && (this.meanLower > 0) && (this.sdUpper > 0) && (this.sdLower > 0) && (this.ratio >= 0) && (this.value > 0)) {
            a = (b - this.meanUpper) / this.sdUpper;
            c = (b - this.meanLower) / this.sdLower;
            return c + (this.ratio * (a - c));
        } else {
            return -100;
        }
    };
}
MeanSdInterpolatedClass.prototype = new LMSClass();

function bmiRound(d, c) {
    var b, a;
    b = d * c;
    b = Math.round(b);
    a = b / c;
    return a;
}
