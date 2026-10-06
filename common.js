var MSEC_PER_MONTH = 2628000000;
var MSEC_PER_DAY = 86400000;
var MSEC_PER_HOUR = 3600000;
var MSEC_PER_YEAR = 31536000000;
function resultStringWithRef(a, b) {
    this.resultString = a;
    this.refName = b
}
function writeRefString(d) {
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(h) {
            var g = this.length >>> 0;
            var j = Number(arguments[1]) || 0;
            j = (j < 0) ? Math.ceil(j) : Math.floor(j);
            if (j < 0) {
                j += g
            }
            for (; j < g; j++) {
                if (j in this && this[j] === h) {
                    return j
                }
            }
            return -1
        }
    }
    var b = new Array("¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","¹⁰","¹¹","¹²","¹³","¹⁴","¹⁵","¹⁶","¹⁷","¹⁸","¹⁹")
      , f = []
      , a = 0
      , e = "";
    for (var c = 0; c < d.length; c++) {
        a = f.indexOf(d[c].refName);
        if (a < 0) {
            a = f.push(d[c].refName) - 1
        }
        d[c].resultString += b[a]
    }
    for (var c = 0; c < d.length; c++) {
        e = e + d[c].resultString + "; "
    }
    e += "\n";
    for (var c = 0; c < f.length; c++) {
        e = e + (c + 1) + ") " + f[c] + "; "
    }
    return e
}
function formatPercentile(a) {
    var b;
    a = a * 100;
    if (a >= 99.5) {
        b = ">99"
    } else {
        if (a < 0.5) {
            b = "<1"
        } else {
            b = a.toFixed(0)
        }
    }
    return b
}
function LMSClass() {
    this.hidePercentile = false;
    this.showResults = function(c) {
        var f;
        var d = this.getZFromValue(this.value);
        var a, b = 0;
        f = this.getErrorNotes();
        if ((f.length === 0) && (d != -100)) {
            setZMarker(this.paramName, d, 100);
            var e = get_auc_from_z(d);
            a = formatPercentile(e);
            d = d.toFixed(2);
            if (!this.hidePercentile) {
                $("#percentile_" + this.paramName).html(a + " P.")
            }
            $("#sds_" + this.paramName).html(d + " z");
            if (this.hidePercentile) {
                c.push(new resultStringWithRef(window.lang.convert(this.paramNameLong) + " " + this.value + " " + this.paramUnit + " (" + d + "z)",this.refString))
            } else {
                if (this.hideZ) {
                    c.push(new resultStringWithRef(window.lang.convert(this.paramNameLong) + " " + this.value + " " + this.paramUnit + " (" + this.lln + " - " + this.uln + " " + this.paramUnit + ")",this.refString))
                } else {
                    c.push(new resultStringWithRef(window.lang.convert(this.paramNameLong) + " " + this.value + " " + this.paramUnit + " (" + a + "P, " + d + "z)",this.refString))
                }
            }
        } else {
            this.errorCondition.push(true);
            this.errorString.push(window.lang.convert("Calculation failed"))
        }
        if (f != "") {
            $("#btn" + this.paramName).buttonMarkup({
                theme: "b"
            })
        } else {
            $("#btn" + this.paramName).buttonMarkup({
                theme: "a"
            })
        }
        $("#error" + this.paramName).html(f);
        return c
    }
    ;
    this.init = function() {
        this.errorCondition = [];
        this.errorString = []
    }
    ;
    this.getRefString = function() {
        return this.refString
    }
    ;
    this.getInfo = function(c) {
        var a = "";
        for (var b = 0; b < c.length; b++) {
            a += "<p>" + c[b] + "</p>"
        }
        return a
    }
    ;
    this.getErrorNotes = function() {
        var a, b;
        a = "";
        for (b = 0; b < this.errorCondition.length; b++) {
            if (this.errorCondition[b]) {
                a = a + "<li>" + this.errorString[b] + "</li>"
            }
        }
        if (a != "") {
            a = "<ul>" + a + "</ul>"
        }
        return a
    }
    ;
    this.getLowerAndUpperValues = function() {
        if (this.male) {
            this.lArray = this.lArrayMale;
            this.mArray = this.mArrayMale;
            this.sArray = this.sArrayMale
        } else {
            this.lArray = this.lArrayFemale;
            this.mArray = this.mArrayFemale;
            this.sArray = this.sArrayFemale
        }
        if ((this.age < this.ageArray[0]) || (this.age > this.ageArray[this.ageArray.length - 1])) {
            return -100
        }
        for (i = 0; i < this.ageArray.length; i++) {
            if (this.ageArray[i] == this.age) {
                upperIndex = i;
                lowerIndex = i;
                break
            } else {
                if (this.ageArray[i] > this.age) {
                    upperIndex = i;
                    lowerIndex = --i;
                    break
                }
            }
        }
        if (i === this.ageArray.length) {
            return -100
        }
        if (this.age == this.ageArray[lowerIndex]) {
            this.ratio = 0
        } else {
            this.ratio = (this.age - this.ageArray[lowerIndex]) / (this.ageArray[upperIndex] - this.ageArray[lowerIndex])
        }
        this.lLower = this.lArray[lowerIndex];
        this.lUpper = this.lArray[upperIndex];
        this.mLower = this.mArray[lowerIndex];
        this.mUpper = this.mArray[upperIndex];
        this.sLower = this.sArray[lowerIndex];
        this.sUpper = this.sArray[upperIndex]
    }
    ;
    this.getZFromValue = function(c) {
        var d, b, a;
        if (typeof (this.lLower) == "undefined" || typeof (this.mLower) == "undefined" || typeof (this.sLower) == "undefined" || typeof (this.lUpper) == "undefined" || typeof (this.mUpper) == "undefined" || typeof (this.sUpper) == "undefined" || typeof (this.value) == "undefined" || (c === -1)) {
            return -100
        }
        d = get_z_from_lms(c, this.lLower, this.mLower, this.sLower);
        b = get_z_from_lms(c, this.lUpper, this.mUpper, this.sUpper);
        a = d + (this.ratio * (b - d));
        return a
    }
    ;
    this.getValueFromZ = function(c) {
        var d, b, a;
        if (typeof (this.lLower) == "undefined" || typeof (this.mLower) == "undefined" || typeof (this.sLower) == "undefined" || typeof (this.lUpper) == "undefined" || typeof (this.mUpper) == "undefined" || typeof (this.sUpper) == "undefined" || typeof (this.value) == "undefined" || (c === -1)) {
            return -100
        }
        d = get_value_from_lms(c, this.lLower, this.mLower, this.sLower);
        b = get_value_from_lms(c, this.lUpper, this.mUpper, this.sUpper);
        a = d + (this.ratio * (b - d));
        return a
    }
}
function MeanSdClass() {
    this.uln = 0;
    this.lln = 0;
    this.setLimitsOfNormal = function(b, a) {
        this.uln = a;
        this.lln = b
    }
    ;
    this.getValueFromZ = function(a) {
        if ((this.mean == undefined) || (this.sd == undefined) || (a == undefined)) {
            return -100
        }
        return this.mean + (a * this.sd)
    }
    ;
    this.getZFromValue = function(a) {
        if ((this.mean == undefined) || (this.sd == undefined) || (a <= 0)) {
            return -100
        }
        return (a - this.mean) / this.sd
    }
}
MeanSdClass.prototype = new LMSClass();
function MeanSDCoefficientClass() {
    this.getZFromValue = function(c) {
        if ((this.coefficients.length == 6) && (this.bsa > 0) && (c > 0)) {
            var b = this.coefficients[0] + this.coefficients[1] * this.bsa + this.coefficients[2] * Math.pow(this.bsa, 2) + this.coefficients[3] * Math.pow(this.bsa, 3);
            var a = (Math.log(c / 10) - b) / Math.sqrt(this.coefficients[4]);
            return a
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(c) {
        if ((this.coefficients.length == 6) && (this.bsa > 0)) {
            var b = this.coefficients[0] + this.coefficients[1] * this.bsa + this.coefficients[2] * Math.pow(this.bsa, 2) + this.coefficients[3] * Math.pow(this.bsa, 3);
            var a = Math.exp((c * Math.sqrt(this.coefficients[4])) + b);
            a *= 10;
            return a
        } else {
            return -100
        }
    }
}
MeanSDCoefficientClass.prototype = new LMSClass();
function MeanSdInterpolatedClass() {
    this.meanUpper = -1;
    this.meanLower = -1;
    this.getLowerAndUpperValues = function() {
        var a, b, c;
        if ((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1])) {
            return -100
        }
        for (a = 0; a < this.grid.length; a++) {
            if (this.grid[a] == this.corValue) {
                b = a;
                c = a;
                break
            } else {
                if (this.grid[a] > this.corValue) {
                    b = a;
                    c = --a;
                    break
                }
            }
        }
        if (a === this.grid.length) {
            return -100
        }
        if (this.corValue == this.grid[c]) {
            this.ratio = 0
        } else {
            this.ratio = (this.corValue - this.grid[c]) / (this.grid[b] - this.grid[c])
        }
        this.meanLower = this.meanArray[c];
        this.meanUpper = this.meanArray[b];
        this.sdLower = this.sdArray[c];
        this.sdUpper = this.sdArray[b]
    }
    ;
    this.getValueFromZ = function(b) {
        var a, c;
        if ((this.meanUpper > 0) && (this.meanLower > 0) && (this.sdUpper > 0) && (this.sdLower > 0) && (this.ratio >= 0)) {
            a = this.meanUpper + (b * this.sdUpper);
            c = this.meanLower + (b * this.sdLower);
            return c + (this.ratio * (a - c))
        } else {
            return -100
        }
    }
    ;
    this.getZFromValue = function(b) {
        var a, c;
        if ((this.meanUpper > 0) && (this.meanLower > 0) && (this.sdUpper > 0) && (this.sdLower > 0) && (this.ratio >= 0) && (this.value > 0)) {
            a = (b - this.meanUpper) / this.sdUpper;
            c = (b - this.meanLower) / this.sdLower;
            return c + (this.ratio * (a - c))
        } else {
            return -100
        }
    }
}
MeanSdInterpolatedClass.prototype = new LMSClass();
function addRef(b, c) {
    var a;
    for (a = 0; a < b.length; a++) {
        if (b[a] == c) {
            return a
        }
    }
    b[a] = c;
    return a
}
function toOutputStringPercentile(e, b, g, a, f, c) {
    var d = new Array("¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","¹⁰","¹¹","¹²","¹³","¹⁴","¹⁵","¹⁶","¹⁷","¹⁸","¹⁹");
    return window.lang.convert(e) + ": " + g + " " + b + " (" + a + "P, " + f + "z)" + d[c] + "; "
}
function toOutputString(d, a, f, e, b) {
    var c = new Array("¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","¹⁰","¹¹","¹²","¹³","¹⁴","¹⁵","¹⁶","¹⁷","¹⁸","¹⁹");
    return window.lang.convert(d) + ": " + f + " " + a + " (" + e + "z)" + c[b] + "; "
}
function getBrowserLanguage() {
    var a;
    if (typeof navigator.language != "undefined") {
        a = navigator.language
    } else {
        a = navigator.browserLanguage
    }
    if ((a.indexOf("de") > -1) || (navigator.userAgent.indexOf("de-") > -1)) {
        lang_short = "de"
    } else {
        if ((a.indexOf("es") > -1) || (navigator.userAgent.indexOf("es-") > -1)) {
            lang_short = "es"
        } else {
            lang_short = ""
        }
    }
    return lang_short
}
function checkLocalStorageSupport() {
    try {
        return "localStorage"in window && window.localStorage !== null
    } catch (a) {
        return false
    }
}
function getDateFromDateString(d) {
    var b = getBrowserLanguage();
    switch (b) {
    case "de":
        if (d.indexOf(".") == -1) {
            alert("Invalid date format. Mail to author");
            return ""
        }
        var g = d.split(".");
        var f = g[2];
        var a = g[1];
        var c = g[0];
        break;
    default:
        if (d.indexOf("/") == -1) {
            alert("Invalid date format. Mail to author");
            return ""
        }
        var g = d.split("/");
        var f = g[2];
        var a = g[0];
        var c = g[1];
        break
    }
    var e = new Date(f,a - 1,c);
    return e
}
function getZFromValueMeanSD(b, a, c) {
    var d = (b - a) / c;
    return d
}
function fenton(m) {
    var l, k;
    var c = {};
    var j = (m + "").split("");
    var e = j[0];
    var d = e;
    var g = [e];
    var a = 256;
    var b;
    for (var h = 1; h < j.length; h++) {
        var f = j[h].charCodeAt(0);
        if (f < 256) {
            b = j[h]
        } else {
            b = c[f] ? c[f] : (d + e)
        }
        g.push(b);
        e = b.charAt(0);
        c[a] = d + e;
        a++;
        d = b
    }
    l = stringArrayToNumberArray(g.join("").split(","));
    return l
}
function interpolateValueFromArray(j, h, k) {
    var e = j[0];
    var b = j[0];
    var d = j.length;
    if ((k < j[0]) || (k > j[j.length - 1])) {
        return -100
    }
    for (var f = 0; f < d; f++) {
        if (k == j[f]) {
            return h[f]
        } else {
            if (k < j[f]) {
                var a = f;
                var c = f - 1;
                b = j[a];
                e = j[c];
                var g = (k - e) / (b - e);
                var l = (g * (h[a] - h[c])) + h[c];
                return l
            }
        }
    }
    return -100
}
function stringArrayToNumberArray(b) {
    var c;
    var a = new Array();
    for (c = 0; c < b.length; c++) {
        a.push(b[c] * 1)
    }
    return a
}
function bmiRound(d, c) {
    var b, a;
    b = d * c;
    b = Math.round(b);
    a = b / c;
    return a
}
function setZMarker(d, c, b) {
    var a;
    $("#li-" + d + " .zs-result-marker").css("visibility", "visible");
    if (c < -2) {
        $("#li-" + d + " .zs-arrow-right").css("visibility", "hidden");
        $("#li-" + d + " .zs-result-marker").css("left", 0 - ((b / 9)) + "px");
        $("#li-" + d + " .zs-result-marker").css("width", "0px");
        $("#li-" + d + " .zs-arrow-left").css("visibility", "visible")
    } else {
        if (c > 2) {
            $("#li-" + d + " .zs-arrow-left").css("visibility", "hidden");
            $("#li-" + d + " .zs-result-marker").css("left", b + (b / 9) - 1 + "px");
            $("#li-" + d + " .zs-result-marker").css("width", "0px");
            $("#li-" + d + " .zs-arrow-right").css("visibility", "visible")
        } else {
            a = (b / 4) * c + (b / 2);
            $("#li-" + d + " .zs-arrow-left").css("visibility", "hidden");
            $("#li-" + d + " .zs-arrow-right").css("visibility", "hidden");
            $("#li-" + d + " .zs-result-marker").css("left", a + "px");
            $("#li-" + d + " .zs-result-marker").css("width", "2px")
        }
    }
}
function zeroPad(b, c) {
    var a = (String(c).length - String(b).length) + 1;
    return a > 0 ? new Array(a).join("0") + b : b
}
function setUnits() {
    var a = getUnitsStorage();
    if (a == null) {
        a = "metric"
    }
    setUnitsFlip(a)
}
function setDatePicker() {
    var a = getDateInputStorage();
    if (a == null) {
        if ("ontouchstart"in document.documentElement) {
            a = "mobile"
        } else {
            a = "desktop"
        }
    }
    showDateInput(a);
    setDateInputFlip(a)
}
function setUnitsStorage(a) {
    if (checkLocalStorageSupport()) {
        localStorage.setItem("units", a)
    }
}
function setDateInputStorage(a) {
    if (checkLocalStorageSupport()) {
        localStorage.setItem("dateinput", a)
    }
}
function getDateInputStorage() {
    var a;
    if (checkLocalStorageSupport()) {
        var b = localStorage.getItem("dateinput");
        return b
    }
    return null
}
function getUnitsStorage() {
    var a;
    if (checkLocalStorageSupport()) {
        var a = localStorage.getItem("units");
        return a
    }
    return null
}
function dateInputKeyUp(b, c) {
    var d;
    if (b.attr("maxlength") == b.val().length) {
        var a = b.closest("form").find(":input");
        a.eq(a.index(b) + 1).focus()
    }
    switch (c) {
    case "bmi":
        bmi_calc();
        break;
    case "gestation":
        gestation_calc();
        break;
    case "bp":
        bp_calc();
        break;
    case "mmode":
        mmode_calc();
        break;
    case "spiro":
        spiro_calc();
        break;
    case "gfr":
        gfr_calc();
        break;
    case "mriv":
        mriv_calc();
        break
    }
}
function setCurrentDate(b) {
    var a = new Date();
    $("#" + b + "_d").val(a.getDate());
    $("#" + b + "_m").val(a.getMonth() + 1);
    $("#" + b + "_y").val(a.getFullYear())
}
function showDateInput(a) {
    if (a == "mobile") {
        $("#dateInputMobile").css("display", "block");
        $("#dateInputDesktop").css("display", "none")
    } else {
        $("#dateInputMobile").css("display", "none");
        $("#dateInputDesktop").css("display", "block")
    }
}
function setDateInputFlip(a) {
    $("#dateInput_flip").val(a)
}
function setUnitsFlip(a) {
    $("#units_flip").val(a)
}
function convertCmToInch(a) {
    return a * 0.3937
}
function convertKgToPound(a) {
    return a / 0.4536
}
function convertInchToCm(a) {
    return a / 0.3937
}
function convertPoundToKg(a) {
    return a * 0.4536
}
;