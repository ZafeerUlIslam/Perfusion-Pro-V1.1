var INFO_KAMPMANN, INFO_ZSCORE, INFO_AORTA, INFO_PULMO, INFO_VALVES, INFO_FUNCTION;
var REF_KAMPMANN = "Kampmann et al. 2000";
var REF_GAUTIER = "Gautier et al. 2010";
var REF_PETERSSEN = "Peterssen et al. 2008";
var REF_ZILBERMAN = "Zilberman et al. 2008";
var REF_DALLAIRE = "Dallaire et al. 2011";
var REF_DALLAIRE2 = "Dallaire et al. 2016";
var REF_KOESTENBERGER_MAPSE = "Koestenberger et al. 2012";
var REF_KOESTENBERGER_MAPSV = "Koestenberger et al. 2014";
var REF_KOESTENBERGER_TAPSE = "Koestenberger et al. 2009";
var REF_KOESTENBERGER_TAPSV = "Koestenberger et al. 2011";
var INFO_KOESTENBERGER_MAPSE = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/22795292" target=_blank>Koestenberger et al. 2012</a>';
var INFO_KOESTENBERGER_TAPSE = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/19423286" target=_blank>Koestenberger et al. 2009</a>';
var INFO_KOESTENBERGER_MAPSV = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/25271547" target=_blank>Koestenberger et al. 2014</a>';
var INFO_KOESTENBERGER_TAPSV = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/21944674" target=_blank>Koestenberger et al. 2011</a>';
var INFO_GAUTIER = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/20211339" target=_blank>Gautier et al. 2010</a>';
var INFO_PETERSSEN = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/18406572" target=_blank>Peterssen et al. 2008</a>';
var INFO_ZILBERMAN = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/16374684" target=_blank>Zilberman et al. 2008</a>';
var INFO_DALLAIRE = '<a href="http://www.ncbi.nlm.nih.gov/pubmed/21074965" target=_blank>Dallaire et al. 2011</a>';
var INFO_DALLAIRE2 = '<a href="https://www.ncbi.nlm.nih.gov/pubmed/27185223" target=_blank>Dallaire et al. 2016</a>';
var ABBREV_KAMPMANN = "RVAWd: Right ventricular anterior wall diastolic; RVDD: Right ventricular diameter diastolic; IVSd: Interventricular septum diastolic; IVSs: Interventricular septum systolic; LVEDD: Left ventricular enddiastolic diameter; LVESD: Left ventricular endsystolic diameter; LVPWd: Left ventricular posterior wall diastolic; LVPWs: Left ventricular posterior wall systolic";
var ABBREV_KOESTENBERGER = "TAPSE: Tricuspidal anulus peak systolic excursion; MAPSE: Mitral anulus peak systolic excursion; TAPSV: Tricuspidal anulus peak systolic velocity; MAPSV: Mitral anulus peak systolic velocity";
function setStrings() {
    INFO_KAMPMANN = window.lang.convert("Cardiac M-Mode measurements in PLAX");
    INFO_ZSCORE = window.lang.convert("The diagram represents following interval") + ": -2z, 0z, +2z";
    INFO_AORTA = window.lang.convert("Maximal diameters of the aortic arch (between innominate and left carotid arteries), isthmus (immediately beyond left subclavian artery), distal aortic arch (beyond aortic isthmus), and descending aorta (at the level of diaphragm)");
    INFO_PULMO = window.lang.convert("Pulmonary z-scores according to");
    INFO_CORO = window.lang.convert("Coronary z-scores according to");
    INFO_LVSTRAIN = window.lang.convert("LV strain z-scores according to");
    INFO_FUNCTION = window.lang.convert("Z-scores for LV and RV function parameters according to");
    INFO_VALVES = window.lang.convert("Valve z-scores according to")
}
function mmode_calc() {
    var c = $("#height").val().replace(",", ".") * 1;
    var ae = $("#weight").val().replace(",", ".") * 1;
    var g = $("#Rvawd").val().replace(/,/, ".") * 1;
    var G = $("#Rvdd").val().replace(/,/, ".") * 1;
    var ah = $("#Ivsd").val().replace(/,/, ".") * 1;
    var W = $("#Ivss").val().replace(/,/, ".") * 1;
    var L = $("#Lvedd").val().replace(/,/, ".") * 1;
    var Q = $("#Lvesd").val().replace(/,/, ".") * 1;
    var b = $("#Lvpwd").val().replace(/,/, ".") * 1;
    var ai = $("#Lvpws").val().replace(/,/, ".") * 1;
    var d = $("#Anulus").val().replace(/,/, ".") * 1;
    var r = $("#Sov").val().replace(/,/, ".") * 1;
    var Y = $("#Stj").val().replace(/,/, ".") * 1;
    var ar = $("#Aao").val().replace(/,/, ".") * 1;
    var al = $("#Taa").val().replace(/,/, ".") * 1;
    var N = $("#Isthmus").val().replace(/,/, ".") * 1;
    var ap = $("#Distarch").val().replace(/,/, ".") * 1;
    var P = $("#Dao").val().replace(/,/, ".") * 1;
    var af = $("#Mpa").val().replace(/,/, ".") * 1;
    var t = $("#Rpa").val().replace(/,/, ".") * 1;
    var ao = $("#Lpa").val().replace(/,/, ".") * 1;
    var l = $("#Mv").val().replace(/,/, ".") * 1;
    var am = $("#Tv").val().replace(/,/, ".") * 1;
    var x = $("#Aov").val().replace(/,/, ".") * 1;
    var p = $("#Pv").val().replace(/,/, ".") * 1;
    var C = $("#Lmca").val().replace(/,/, ".") * 1;
    var ad = $("#Lad").val().replace(/,/, ".") * 1;
    var F = $("#Cx").val().replace(/,/, ".") * 1;
    var h = $("#Rcaprox").val().replace(/,/, ".") * 1;
    var aq = $("#Rcamed").val().replace(/,/, ".") * 1;
    var at = $("#Rcadist").val().replace(/,/, ".") * 1;
    var E = $("#Mapse").val().replace(/,/, ".") * 1;
    var M = $("#Tapse").val().replace(/,/, ".") * 1;
    var v = $("#Mapsv").val().replace(/,/, ".") * 1;
    var y = $("#Tapsv").val().replace(/,/, ".") * 1;
    var R = $("#Basalcs").val().replace(/,/, ".") * 1;
    var j = $("#Midcs").val().replace(/,/, ".") * 1;
    var ab = $("#Apicalcs").val().replace(/,/, ".") * 1;
    var u = $("#Meanls").val().replace(/,/, ".") * 1;
    var X, an, D, J, I, ag, e, O, o, n, V, S, B, w, aj, m, U, aa, K, A, ak, q;
    var Z, ac, k, a, f, s, T, H;
    if ($("input[name='radio']:checked").val() == "male") {
        m = true
    } else {
        m = false
    }
    $("* .zs-arrow-left").css("visibility", "hidden");
    $("* .zs-arrow-right").css("visibility", "hidden");
    $("* .zs-result-marker").css("visibility", "hidden");
    $("div[id$='lln']").html("");
    $("div[id$='uln']").html("");
    $("div[id$='mean']").html("");
    $("#mmode_FS").val("");
    U = new Array();
    if ($("#dateInputMobile").css("display") === "block") {
        o = $("#birthday").val();
        n = $("#currentdate").val();
        if ((o != "") && (n != "")) {
            V = getDateFromDateString(o);
            q = getDateFromDateString(n)
        } else {
            O = -1
        }
    } else {
        if ($("#birth_d").val() && $("#birth_m").val() && $("#birth_y").val() && $("#current_d").val() && $("#current_m").val() && $("#current_y").val()) {
            V = new Date($("#birth_y").val(),$("#birth_m").val() - 1,$("#birth_d").val());
            q = new Date($("#current_y").val(),$("#current_m").val() - 1,$("#current_d").val())
        } else {
            O = -1
        }
    }
    if (O != -1) {
        O = (q.getTime() - V.getTime()) / MSEC_PER_MONTH;
        B = Math.floor(O / 12);
        w = Math.floor(O % 12);
        $("#calculatedAgeYears").html(B);
        $("#calculatedAgeMonthsUpper").html(w);
        $("#headerResult").css("display", "block")
    } else {
        $("#headerResult").css("display", "none")
    }
    if ((ae > 0) && (c > 0)) {
        e = bsaDuBois(c, ae);
        $("#bsa_result").html(bmiRound(e, 100) + " m²")
    } else {
        e = 0
    }
    Z = new kampmannRvawd(g,ae,c);
    $("#infoRvawd").html(Z.infoString);
    $("#Rvawd_lln").html(Z.getValueFromZ(-2).toFixed(1));
    $("#Rvawd_mean").html(Z.getValueFromZ(0).toFixed(1));
    $("#Rvawd_uln").html(Z.getValueFromZ(2).toFixed(1));
    U = Z.showResults(U);
    ac = new kampmannRvdd(G,ae,c);
    $("#infoRvdd").html(ac.infoString);
    $("#Rvdd_lln").html(ac.getValueFromZ(-2).toFixed(1));
    $("#Rvdd_mean").html(ac.getValueFromZ(0).toFixed(1));
    $("#Rvdd_uln").html(ac.getValueFromZ(2).toFixed(1));
    U = ac.showResults(U);
    k = new kampmannIvsd(ah,ae,c);
    $("#infoIvsd").html(k.infoString);
    $("#Ivsd_lln").html(k.getValueFromZ(-2).toFixed(1));
    $("#Ivsd_mean").html(k.getValueFromZ(0).toFixed(1));
    $("#Ivsd_uln").html(k.getValueFromZ(2).toFixed(1));
    U = k.showResults(U);
    a = new kampmannIvss(W,ae,c);
    $("#infoIvss").html(a.infoString);
    $("#Ivss_lln").html(a.getValueFromZ(-2).toFixed(1));
    $("#Ivss_mean").html(a.getValueFromZ(0).toFixed(1));
    $("#Ivss_uln").html(a.getValueFromZ(2).toFixed(1));
    U = a.showResults(U);
    f = new kampmannLvedd(L,ae,c);
    $("#infoLvedd").html(f.infoString);
    $("#Lvedd_lln").html(f.getValueFromZ(-2).toFixed(1));
    $("#Lvedd_mean").html(f.getValueFromZ(0).toFixed(1));
    $("#Lvedd_uln").html(f.getValueFromZ(2).toFixed(1));
    U = f.showResults(U);
    s = new kampmannLvesd(Q,ae,c);
    $("#infoLvesd").html(s.infoString);
    $("#Lvesd_lln").html(s.getValueFromZ(-2).toFixed(1));
    $("#Lvesd_mean").html(s.getValueFromZ(0).toFixed(1));
    $("#Lvesd_uln").html(s.getValueFromZ(2).toFixed(1));
    U = s.showResults(U);
    T = new kampmannLvpwd(b,ae,c);
    $("#infoLvpwd").html(T.infoString);
    $("#Lvpwd_lln").html(T.getValueFromZ(-2).toFixed(1));
    $("#Lvpwd_mean").html(T.getValueFromZ(0).toFixed(1));
    $("#Lvpwd_uln").html(T.getValueFromZ(2).toFixed(1));
    U = T.showResults(U);
    H = new kampmannLvpws(ai,ae,c);
    $("#infoLvpws").html(H.infoString);
    $("#Lvpws_lln").html(H.getValueFromZ(-2).toFixed(1));
    $("#Lvpws_mean").html(H.getValueFromZ(0).toFixed(1));
    $("#Lvpws_uln").html(H.getValueFromZ(2).toFixed(1));
    U = H.showResults(U);
    obAnulus = new gautierAnulus(d,ae,c,m);
    $("#infoAnulus").html(obAnulus.infoString);
    $("#Anulus_lln").html(obAnulus.getValueFromZ(-2).toFixed(1));
    $("#Anulus_mean").html(obAnulus.getValueFromZ(0).toFixed(1));
    $("#Anulus_uln").html(obAnulus.getValueFromZ(2).toFixed(1));
    U = obAnulus.showResults(U);
    obSov = new gautierSov(r,ae,c,m);
    $("#infoSov").html(obSov.infoString);
    $("#Sov_lln").html(obSov.getValueFromZ(-2).toFixed(1));
    $("#Sov_mean").html(obSov.getValueFromZ(0).toFixed(1));
    $("#Sov_uln").html(obSov.getValueFromZ(2).toFixed(1));
    U = obSov.showResults(U);
    obStj = new gautierStj(Y,ae,c,m);
    $("#infoStj").html(obStj.infoString);
    $("#Stj_lln").html(obStj.getValueFromZ(-2).toFixed(1));
    $("#Stj_mean").html(obStj.getValueFromZ(0).toFixed(1));
    $("#Stj_uln").html(obStj.getValueFromZ(2).toFixed(1));
    U = obStj.showResults(U);
    obAao = new gautierAao(ar,ae,c,m);
    $("#infoAao").html(obAao.infoString);
    $("#Aao_lln").html(obAao.getValueFromZ(-2).toFixed(1));
    $("#Aao_mean").html(obAao.getValueFromZ(0).toFixed(1));
    $("#Aao_uln").html(obAao.getValueFromZ(2).toFixed(1));
    U = obAao.showResults(U);
    obTaa = new peterssenTaa(al,ae,c);
    $("#infoTaa").html(obTaa.infoString);
    $("#Taa_lln").html(obTaa.getValueFromZ(-2).toFixed(1));
    $("#Taa_mean").html(obTaa.getValueFromZ(0).toFixed(1));
    $("#Taa_uln").html(obTaa.getValueFromZ(2).toFixed(1));
    U = obTaa.showResults(U);
    obIsthmus = new peterssenIsthmus(N,ae,c);
    $("#infoIsthmus").html(obIsthmus.infoString);
    $("#Isthmus_lln").html(obIsthmus.getValueFromZ(-2).toFixed(1));
    $("#Isthmus_mean").html(obIsthmus.getValueFromZ(0).toFixed(1));
    $("#Isthmus_uln").html(obIsthmus.getValueFromZ(2).toFixed(1));
    U = obIsthmus.showResults(U);
    obDistarch = new peterssenDistarch(ap,ae,c);
    $("#infoDistarch").html(obDistarch.infoString);
    $("#Distarch_lln").html(obDistarch.getValueFromZ(-2).toFixed(1));
    $("#Distarch_mean").html(obDistarch.getValueFromZ(0).toFixed(1));
    $("#Distarch_uln").html(obDistarch.getValueFromZ(2).toFixed(1));
    U = obDistarch.showResults(U);
    obDao = new peterssenDao(P,ae,c);
    $("#infoDao").html(obDao.infoString);
    $("#Dao_lln").html(obDao.getValueFromZ(-2).toFixed(1));
    $("#Dao_mean").html(obDao.getValueFromZ(0).toFixed(1));
    $("#Dao_uln").html(obDao.getValueFromZ(2).toFixed(1));
    U = obDao.showResults(U);
    obMpa = new peterssenMpa(af,ae,c);
    $("#infoMpa").html(obMpa.infoString);
    $("#Mpa_lln").html(obMpa.getValueFromZ(-2).toFixed(1));
    $("#Mpa_mean").html(obMpa.getValueFromZ(0).toFixed(1));
    $("#Mpa_uln").html(obMpa.getValueFromZ(2).toFixed(1));
    U = obMpa.showResults(U);
    obLpa = new peterssenLpa(ao,ae,c);
    $("#infoLpa").html(obLpa.infoString);
    $("#Lpa_lln").html(obLpa.getValueFromZ(-2).toFixed(1));
    $("#Lpa_mean").html(obLpa.getValueFromZ(0).toFixed(1));
    $("#Lpa_uln").html(obLpa.getValueFromZ(2).toFixed(1));
    U = obLpa.showResults(U);
    obRpa = new peterssenRpa(t,ae,c);
    $("#infoRpa").html(obRpa.infoString);
    $("#Rpa_lln").html(obRpa.getValueFromZ(-2).toFixed(1));
    $("#Rpa_mean").html(obRpa.getValueFromZ(0).toFixed(1));
    $("#Rpa_uln").html(obRpa.getValueFromZ(2).toFixed(1));
    U = obRpa.showResults(U);
    obPv = new zilbermanPv(p,ae,c);
    $("#infoPv").html(obPv.infoString);
    $("#Pv_lln").html(obPv.getValueFromZ(-2).toFixed(1));
    $("#Pv_mean").html(obPv.getValueFromZ(0).toFixed(1));
    $("#Pv_uln").html(obPv.getValueFromZ(2).toFixed(1));
    U = obPv.showResults(U);
    obAov = new zilbermanAov(x,ae,c);
    $("#infoAov").html(obAov.infoString);
    $("#Aov_lln").html(obAov.getValueFromZ(-2).toFixed(1));
    $("#Aov_mean").html(obAov.getValueFromZ(0).toFixed(1));
    $("#Aov_uln").html(obAov.getValueFromZ(2).toFixed(1));
    U = obAov.showResults(U);
    obTv = new zilbermanTv(am,ae,c);
    $("#infoTv").html(obTv.infoString);
    $("#Tv_lln").html(obTv.getValueFromZ(-2).toFixed(1));
    $("#Tv_mean").html(obTv.getValueFromZ(0).toFixed(1));
    $("#Tv_uln").html(obTv.getValueFromZ(2).toFixed(1));
    U = obTv.showResults(U);
    obMv = new zilbermanMv(l,ae,c);
    $("#infoMv").html(obMv.infoString);
    $("#Mv_lln").html(obMv.getValueFromZ(-2).toFixed(1));
    $("#Mv_mean").html(obMv.getValueFromZ(0).toFixed(1));
    $("#Mv_uln").html(obMv.getValueFromZ(2).toFixed(1));
    U = obMv.showResults(U);
    obLmca = new dallaireLmca(C,ae,c);
    $("#infoLmca").html(obLmca.infoString);
    $("#Lmca_lln").html(obLmca.getValueFromZ(-2).toFixed(1));
    $("#Lmca_mean").html(obLmca.getValueFromZ(0).toFixed(1));
    $("#Lmca_uln").html(obLmca.getValueFromZ(2).toFixed(1));
    U = obLmca.showResults(U);
    obCx = new dallaireCx(F,ae,c);
    $("#infoCx").html(obCx.infoString);
    $("#Cx_lln").html(obCx.getValueFromZ(-2).toFixed(1));
    $("#Cx_mean").html(obCx.getValueFromZ(0).toFixed(1));
    $("#Cx_uln").html(obCx.getValueFromZ(2).toFixed(1));
    U = obCx.showResults(U);
    obLad = new dallaireLad(ad,ae,c);
    $("#infoLad").html(obLad.infoString);
    $("#Lad_lln").html(obLad.getValueFromZ(-2).toFixed(1));
    $("#Lad_mean").html(obLad.getValueFromZ(0).toFixed(1));
    $("#Lad_uln").html(obLad.getValueFromZ(2).toFixed(1));
    U = obLad.showResults(U);
    obRcaprox = new dallaireRcaprox(h,ae,c);
    $("#infoRcaprox").html(obRcaprox.infoString);
    $("#Rcaprox_lln").html(obRcaprox.getValueFromZ(-2).toFixed(1));
    $("#Rcaprox_mean").html(obRcaprox.getValueFromZ(0).toFixed(1));
    $("#Rcaprox_uln").html(obRcaprox.getValueFromZ(2).toFixed(1));
    U = obRcaprox.showResults(U);
    obRcamed = new dallaireRcamed(aq,ae,c);
    $("#infoRcamed").html(obRcamed.infoString);
    $("#Rcamed_lln").html(obRcamed.getValueFromZ(-2).toFixed(1));
    $("#Rcamed_mean").html(obRcamed.getValueFromZ(0).toFixed(1));
    $("#Rcamed_uln").html(obRcamed.getValueFromZ(2).toFixed(1));
    U = obRcamed.showResults(U);
    obRcadist = new dallaireRcadist(at,ae,c);
    $("#infoRcadist").html(obRcadist.infoString);
    $("#Rcadist_lln").html(obRcadist.getValueFromZ(-2).toFixed(1));
    $("#Rcadist_mean").html(obRcadist.getValueFromZ(0).toFixed(1));
    $("#Rcadist_uln").html(obRcadist.getValueFromZ(2).toFixed(1));
    U = obRcadist.showResults(U);
    obTapse = new koestenbergerTapse(M,O);
    $("#infoTapse").html(obTapse.infoString);
    $("#Tapse_lln").html(obTapse.getValueFromZ(-2).toFixed(1));
    $("#Tapse_mean").html(obTapse.getValueFromZ(0).toFixed(1));
    $("#Tapse_uln").html(obTapse.getValueFromZ(2).toFixed(1));
    U = obTapse.showResults(U);
    obMapse = new koestenbergerMapse(E,O);
    $("#infoMapse").html(obMapse.infoString);
    $("#Mapse_lln").html(obMapse.getValueFromZ(-2).toFixed(1));
    $("#Mapse_mean").html(obMapse.getValueFromZ(0).toFixed(1));
    $("#Mapse_uln").html(obMapse.getValueFromZ(2).toFixed(1));
    U = obMapse.showResults(U);
    obTapsv = new koestenbergerTapsv(y,O);
    $("#infoTapsv").html(obTapsv.infoString);
    $("#Tapsv_lln").html(obTapsv.getValueFromZ(-2).toFixed(1));
    $("#Tapsv_mean").html(obTapsv.getValueFromZ(0).toFixed(1));
    $("#Tapsv_uln").html(obTapsv.getValueFromZ(2).toFixed(1));
    U = obTapsv.showResults(U);
    obMapsv = new koestenbergerMapsv(v,ae,c);
    $("#infoMapsv").html(obMapsv.infoString);
    $("#Mapsv_lln").html(obMapsv.getValueFromZ(-2).toFixed(1));
    $("#Mapsv_mean").html(obMapsv.getValueFromZ(0).toFixed(1));
    $("#Mapsv_uln").html(obMapsv.getValueFromZ(2).toFixed(1));
    U = obMapsv.showResults(U);
    obBasalcs = new dallaireBasalcs(R,ae,c);
    $("#infoBasalcs").html(obBasalcs.infoString);
    $("#Basalcs_lln").html(obBasalcs.getValueFromZ(-2).toFixed(1));
    $("#Basalcs_mean").html(obBasalcs.getValueFromZ(0).toFixed(1));
    $("#Basalcs_uln").html(obBasalcs.getValueFromZ(2).toFixed(1));
    U = obBasalcs.showResults(U);
    obMidcs = new dallaireMidcs(j,ae,c);
    $("#infoMidcs").html(obMidcs.infoString);
    $("#Midcs_lln").html(obMidcs.getValueFromZ(-2).toFixed(1));
    $("#Midcs_mean").html(obMidcs.getValueFromZ(0).toFixed(1));
    $("#Midcs_uln").html(obMidcs.getValueFromZ(2).toFixed(1));
    U = obMidcs.showResults(U);
    obApicalcs = new dallaireApicalcs(ab,ae,c);
    $("#infoApicalcs").html(obApicalcs.infoString);
    $("#Apicalcs_lln").html(obApicalcs.getValueFromZ(-2).toFixed(1));
    $("#Apicalcs_mean").html(obApicalcs.getValueFromZ(0).toFixed(1));
    $("#Apicalcs_uln").html(obApicalcs.getValueFromZ(2).toFixed(1));
    U = obApicalcs.showResults(U);
    obMeanls = new dallaireMeanls(u,ae,c);
    $("#infoMeanls").html(obMeanls.infoString);
    $("#Meanls_lln").html(obMeanls.getValueFromZ(-2).toFixed(1));
    $("#Meanls_mean").html(obMeanls.getValueFromZ(0).toFixed(1));
    $("#Meanls_uln").html(obMeanls.getValueFromZ(2).toFixed(1));
    U = obMeanls.showResults(U);
    $("div[id$='lln']").each(function(i) {
        if ($(this).html() === "-100.0") {
            $(this).html("")
        }
    });
    $("div[id$='uln']").each(function(i) {
        if ($(this).html() === "-100.0") {
            $(this).html("")
        }
    });
    $("div[id$='mean']").each(function(i) {
        if ($(this).html() === "-100.0") {
            $(this).html("")
        }
    });
    $("#outputContent").html(writeRefString(U))
}
function gautierAnulus(d, c, a, b) {
    this.weight = c || -1;
    this.height = a || -1;
    this.value = d || -1;
    this.hidePercentile = true;
    this.male = b;
    this.refString = REF_GAUTIER;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_GAUTIER, INFO_ZSCORE]);
    this.paramName = "Anulus";
    this.paramNameLong = "Anulus";
    this.paramUnit = "mm";
    if (c && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getValueFromZ = function(e) {
        if (this.bsa > 0) {
            if (this.male) {
                return Math.pow(Math.E, 0.1 * e + 2.78 + (0.47 * Math.log(this.bsa)))
            } else {
                return Math.pow(Math.E, 0.1 * e + 2.75 + (0.44 * Math.log(this.bsa)))
            }
        } else {
            return -100
        }
    }
    ;
    this.getZFromValue = function(e) {
        if ((this.bsa > 0) && (e > 0)) {
            if (this.male) {
                return (Math.log(e) - 2.78 - (0.47 * Math.log(this.bsa))) / 0.1
            } else {
                return (Math.log(e) - 2.75 - (0.44 * Math.log(this.bsa))) / 0.1
            }
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((c <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(d <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
gautierAnulus.prototype = new LMSClass();
function gautierSov(d, c, a, b) {
    this.weight = c || -1;
    this.height = a || -1;
    this.value = d || -1;
    this.hidePercentile = true;
    this.male = b;
    this.refString = REF_GAUTIER;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_GAUTIER, INFO_ZSCORE]);
    this.paramName = "Sov";
    this.paramNameLong = "SoV";
    this.paramUnit = "mm";
    if (c && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getValueFromZ = function(e) {
        if (this.bsa > 0) {
            if (this.male) {
                return Math.pow(Math.E, 0.1 * e + 3.1 + (0.49 * Math.log(this.bsa)))
            } else {
                return Math.pow(Math.E, 0.09 * e + 3.1 + (0.44 * Math.log(this.bsa)))
            }
        } else {
            return -100
        }
    }
    ;
    this.getZFromValue = function(e) {
        if ((this.bsa > 0) && (e > 0)) {
            if (this.male) {
                return (Math.log(e) - 3.1 - (0.49 * Math.log(this.bsa))) / 0.1
            } else {
                return (Math.log(e) - 3.1 - (0.44 * Math.log(this.bsa))) / 0.09
            }
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((c <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(d <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
gautierSov.prototype = new LMSClass();
function gautierStj(d, c, a, b) {
    this.weight = c || -1;
    this.height = a || -1;
    this.value = d || -1;
    this.hidePercentile = true;
    this.male = b;
    this.refString = REF_GAUTIER;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_GAUTIER, INFO_ZSCORE]);
    this.paramName = "Stj";
    this.paramNameLong = "STJ";
    this.paramUnit = "mm";
    if (c && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getValueFromZ = function(e) {
        if (this.bsa > 0) {
            if (this.male) {
                return Math.pow(Math.E, 0.1 * e + 2.9 + (0.47 * Math.log(this.bsa)))
            } else {
                return Math.pow(Math.E, 0.09 * e + 2.9 + (0.42 * Math.log(this.bsa)))
            }
        } else {
            return -100
        }
    }
    ;
    this.getZFromValue = function(e) {
        if ((this.bsa > 0) && (e > 0)) {
            if (this.male) {
                return (Math.log(e) - 2.9 - (0.47 * Math.log(this.bsa))) / 0.1
            } else {
                return (Math.log(e) - 2.9 - (0.42 * Math.log(this.bsa))) / 0.09
            }
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((c <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(d <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
gautierStj.prototype = new LMSClass();
function gautierAao(d, c, a, b) {
    this.weight = c || -1;
    this.height = a || -1;
    this.value = d || -1;
    this.hidePercentile = true;
    this.male = b;
    this.refString = REF_GAUTIER;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_GAUTIER, INFO_ZSCORE]);
    this.paramName = "Aao";
    this.paramNameLong = "AAo";
    this.paramUnit = "mm";
    if (c && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getValueFromZ = function(e) {
        if (this.bsa > 0) {
            if (this.male) {
                return Math.pow(Math.E, 0.11 * e + 2.9 + (0.46 * Math.log(this.bsa)))
            } else {
                return Math.pow(Math.E, 0.1 * e + 2.9 + (0.46 * Math.log(this.bsa)))
            }
        } else {
            return -100
        }
    }
    ;
    this.getZFromValue = function(e) {
        if ((this.bsa > 0) && (e > 0)) {
            if (this.male) {
                return (Math.log(e) - 2.9 - (0.46 * Math.log(this.bsa))) / 0.11
            } else {
                return (Math.log(e) - 2.9 - (0.46 * Math.log(this.bsa))) / 0.1
            }
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((c <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(d <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
gautierAao.prototype = new LMSClass();
function peterssenTaa(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Taa";
    this.paramNameLong = "Transv. arch";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-0.79,3.02,-2.484,0.712,0.023,0.865);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenTaa.prototype = new MeanSDCoefficientClass();
function peterssenIsthmus(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Isthmus";
    this.paramNameLong = "Isthmus";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-1.072,2.539,-1.627,0.368,0.027,0.825);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenIsthmus.prototype = new MeanSDCoefficientClass();
function peterssenDistarch(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Distarch";
    this.paramNameLong = "Distal arch";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-0.976,2.469,-1.746,0.445,0.026,0.792);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenDistarch.prototype = new MeanSDCoefficientClass();
function peterssenDao(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_AORTA + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Dao";
    this.paramNameLong = "DAo";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-0.922,2.1,-1.411,0.371,0.018,0.842);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenDao.prototype = new MeanSDCoefficientClass();
function peterssenMpa(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_PULMO + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Mpa";
    this.paramNameLong = "MPA";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-0.707,2.746,-1.807,0.424,0.024,0.857);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenMpa.prototype = new MeanSDCoefficientClass();
function peterssenLpa(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_PULMO + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Lpa";
    this.paramNameLong = "LPA";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-1.348,2.884,-1.954,0.466,0.028,0.842);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenLpa.prototype = new MeanSDCoefficientClass();
function peterssenRpa(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_PETERSSEN;
    this.init();
    this.infoString = this.getInfo([INFO_PULMO + INFO_PETERSSEN, INFO_ZSCORE]);
    this.paramName = "Rpa";
    this.paramNameLong = "RPA";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.coefficients = new Array(-1.36,3.394,-2.508,0.66,0.027,0.873);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
peterssenRpa.prototype = new MeanSDCoefficientClass();
function zilbermanPv(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_ZILBERMAN;
    this.init();
    this.infoString = this.getInfo([INFO_VALVES + INFO_ZILBERMAN, INFO_ZSCORE]);
    this.paramName = "Pv";
    this.paramNameLong = "PV";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        d /= 10;
        if ((this.bsa > 0) && (this.value > 0)) {
            if (this.male) {
                result = (Math.log(d) - (0.618 + 0.498 * Math.log(this.bsa))) / 0.152
            } else {
                result = (Math.log(d) - (0.597 + 0.476 * Math.log(this.bsa))) / 0.144
            }
            return result
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            if (this.male) {
                result = Math.pow(Math.E, 0.152 * d + 0.618 + 0.498 * Math.log(this.bsa))
            } else {
                result = Math.pow(Math.E, 0.144 * d + 0.597 + 0.476 * Math.log(this.bsa))
            }
            return result * 10
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
zilbermanPv.prototype = new LMSClass();
function zilbermanMv(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_ZILBERMAN;
    this.init();
    this.infoString = this.getInfo([INFO_VALVES + INFO_ZILBERMAN, INFO_ZSCORE]);
    this.paramName = "Mv";
    this.paramNameLong = "MV";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            d /= 10;
            if (this.male) {
                result = (Math.log(d) - (0.765 + 0.425 * Math.log(this.bsa))) / 0.169
            } else {
                result = (Math.log(d) - (0.733 + 0.408 * Math.log(this.bsa))) / 0.18
            }
            return result
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            if (this.male) {
                result = Math.pow(Math.E, 0.169 * d + 0.765 + 0.425 * Math.log(this.bsa))
            } else {
                result = Math.pow(Math.E, 0.18 * d + 0.733 + 0.408 * Math.log(this.bsa))
            }
            return result * 10
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
zilbermanMv.prototype = new LMSClass();
function zilbermanTv(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_ZILBERMAN;
    this.init();
    this.infoString = this.getInfo([INFO_VALVES + INFO_ZILBERMAN, INFO_ZSCORE]);
    this.paramName = "Tv";
    this.paramNameLong = "TV";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            d /= 10;
            if (this.male) {
                result = (Math.log(d) - (0.817 + 0.391 * Math.log(this.bsa))) / 0.171
            } else {
                result = (Math.log(d) - (0.755 + 0.364 * Math.log(this.bsa))) / 0.186
            }
            return result
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            if (this.male) {
                result = Math.pow(Math.E, 0.171 * d + 0.817 + 0.391 * Math.log(this.bsa))
            } else {
                result = Math.pow(Math.E, 0.186 * d + 0.755 + 0.364 * Math.log(this.bsa))
            }
            return result * 10
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
zilbermanTv.prototype = new LMSClass();
function zilbermanAov(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_ZILBERMAN;
    this.init();
    this.infoString = this.getInfo([INFO_VALVES + INFO_ZILBERMAN, INFO_ZSCORE]);
    this.paramName = "Aov";
    this.paramNameLong = "AoV";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            d /= 10;
            if (this.male) {
                result = (Math.log(d) - (0.472 + 0.492 * Math.log(this.bsa))) / 0.141
            } else {
                result = (Math.log(d) - (0.437 + 0.461 * Math.log(this.bsa))) / 0.127
            }
            return result
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            if (this.male) {
                result = Math.pow(Math.E, 0.141 * d + 0.472 + 0.492 * Math.log(this.bsa))
            } else {
                result = Math.pow(Math.E, 0.127 * d + 0.437 + 0.461 * Math.log(this.bsa))
            }
            return result * 10
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
zilbermanAov.prototype = new LMSClass();
function dallaireLmca(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Lmca";
    this.paramNameLong = "LMCA";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.1817 + (2.9238 * Math.sqrt(this.bsa)))) / (0.1801 + (0.253 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1801 + (0.253 * Math.sqrt(this.bsa))) + (-0.1817 + (2.9238 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireLmca.prototype = new LMSClass();
function dallaireCx(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Cx";
    this.paramNameLong = "Cx";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.2716 + (2.3458 * Math.sqrt(this.bsa)))) / (0.1142 + (0.3423 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1142 + (0.3423 * Math.sqrt(this.bsa))) + (-0.2716 + (2.3458 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireCx.prototype = new LMSClass();
function dallaireLad(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Lad";
    this.paramNameLong = "LAD";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.1502 + (2.2672 * Math.sqrt(this.bsa)))) / (0.1709 + (0.2293 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1709 + (0.2293 * Math.sqrt(this.bsa))) + (-0.1502 + (2.2672 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireLad.prototype = new LMSClass();
function dallaireRcaprox(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Rcaprox";
    this.paramNameLong = "RCAprox";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.3039 + (2.7521 * Math.sqrt(this.bsa)))) / (0.1626 + (0.2881 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1626 + (0.2881 * Math.sqrt(this.bsa))) + (-0.3039 + (2.7521 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireRcaprox.prototype = new LMSClass();
function dallaireRcamed(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Rcamed";
    this.paramNameLong = "RCAmed";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.306 + (2.4078 * Math.sqrt(this.bsa)))) / (0.1324 + (0.3259 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1324 + (0.3259 * Math.sqrt(this.bsa))) + (-0.306 + (2.4078 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireRcamed.prototype = new LMSClass();
function dallaireRcadist(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE;
    this.init();
    this.infoString = this.getInfo([INFO_CORO + INFO_DALLAIRE, INFO_ZSCORE]);
    this.paramName = "Rcadist";
    this.paramNameLong = "RCAdist";
    this.paramUnit = "mm";
    if (b && a) {
        this.bsa = bsaHaycock(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (d - (-0.3185 + (2.3295 * Math.sqrt(this.bsa)))) / (0.1099 + (0.3198 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return d * (0.1099 + (0.3198 * Math.sqrt(this.bsa))) + (-0.3185 + (2.3295 * Math.sqrt(this.bsa)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireRcadist.prototype = new LMSClass();
function kampmannRvawd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Rvawd";
    this.paramNameLong = "RVAWD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(2.4,2.5,2.5,2.6,2.6);
        this.sdArray = new Array(0.55,0.55,0.55,0.55,0.55);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(2.6,2.6,2.7,2.7,2.7,2.75,2.75,2.75,2.8,2.8,2.8,2.8,2.8,2.8,2.9,2.9,3,3,3.1,3.1,3.1);
        this.sdArray = new Array(0.6,0.6,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.55,0.6,0.6,0.6);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannRvawd.prototype = new MeanSdInterpolatedClass();
function kampmannRvdd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Rvdd";
    this.paramNameLong = "RVDD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(8.4,8.4,8.5,8.6,8.6);
        this.sdArray = new Array(2.2,2.2,2.2,2.25,2.25);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(8.7,8.7,8.7,8.8,8.9,9,9.3,9.5,9.6,9.9,10.1,10.5,11,11.2,11.8,12.4,13.5,14,15.6,16.5,17.5);
        this.sdArray = new Array(2.25,2.25,2.25,2.25,2.25,2.25,2.25,2.25,2.2,2.2,2.2,2.35,2.3,2.4,2.2,2.4,2.5,2.5,2.8,3.1,3);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannRvdd.prototype = new MeanSdInterpolatedClass();
function kampmannIvsd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Ivsd";
    this.paramNameLong = "IVSD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(3.5,3.5,3.6,3.7,3.8);
        this.sdArray = new Array(0.7,0.7,0.65,0.7,0.7);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(3.8,3.8,3.9,3.9,4.1,4.2,4.3,4.6,4.8,4.8,5,5.2,5.6,5.8,6.2,6.5,6.6,6.7,7.4,8,9.3);
        this.sdArray = new Array(0.7,0.7,0.7,0.7,0.75,0.8,0.8,0.75,0.75,0.75,0.75,0.8,0.9,0.9,0.95,0.9,0.9,0.9,1.1,1.2,1.25);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannIvsd.prototype = new MeanSdInterpolatedClass();
function kampmannIvss(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Ivss";
    this.paramNameLong = "IVSS";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(4.4,5,5.1,5.3,5.4);
        this.sdArray = new Array(1,1.3,1.3,1.4,1.4);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(5.2,5.4,5.8,5.8,6.2,6.3,6.6,6.8,6.9,6.9,7.2,7.5,8.3,8.4,9,9,9,9.2,9.5,9.8,10.3);
        this.sdArray = new Array(1.35,1.4,1.4,1.4,1.5,1.5,1.55,1.55,1.55,1.55,1.5,1.55,1.7,1.65,1.8,1.8,1.8,1.7,1.85,2,1.9);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannIvss.prototype = new MeanSdInterpolatedClass();
function kampmannLvedd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Lvedd";
    this.paramNameLong = "LVEDD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(17.1,18.1,18.2,18.8,19.9);
        this.sdArray = new Array(1.05,1.55,1.55,1.7,1.7);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(20,21.2,22.9,23.6,26,27.1,29,31,31.6,33.2,33.9,35.8,37.1,38.5,39.4,41.7,42.4,43.3,45.4,46.8,53.4);
        this.sdArray = new Array(1.55,2.1,2.45,2.3,2.5,2.55,2.8,2.7,2.8,3,3.25,3.1,3.05,3.4,3.45,3.1,3.3,3,3.2,4,4);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannLvedd.prototype = new MeanSdInterpolatedClass();
function kampmannLvesd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Lvesd";
    this.paramNameLong = "LVESD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(11,11.7,11.7,11.9,12.7);
        this.sdArray = new Array(0.75,1.25,1.25,1.2,1.25);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(13.2,13.6,14.8,14.8,16.1,17,18,19.3,19.9,20.4,21.3,22.7,23.6,24.4,25.2,27.1,27.1,27.6,28.6,29.8,34.4);
        this.sdArray = new Array(1.5,1.6,2,2,2.05,2,2,2.15,2.25,2.35,2.6,2.5,2.8,2.9,2.8,2.8,2.8,2.8,3.05,3.2,4.4);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannLvesd.prototype = new MeanSdInterpolatedClass();
function kampmannLvpwd(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Lvpwd";
    this.paramNameLong = "LVPWD";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(2.7,3.2,3.5,3.6,3.7);
        this.sdArray = new Array(0.4,0.5,0.55,0.55,0.55);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(3.6,3.8,4.1,4.1,4.2,4.6,4.6,4.8,4.8,4.9,5.2,5.7,5.9,5.9,6.3,6.6,6.9,6.9,7.7,8.1,8.1);
        this.sdArray = new Array(0.5,0.55,0.65,0.65,0.65,0.75,0.75,0.75,0.75,0.75,0.85,1.05,1.1,1.1,1.2,1.3,1.3,1.3,1.4,1.5,1.5);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannLvpwd.prototype = new MeanSdInterpolatedClass();
function kampmannLvpws(c, b, a) {
    this.corValue = 0;
    this.value = c || -1;
    this.hidePercentile = true;
    this.weight = b || -1;
    this.height = a || -1;
    this.refString = REF_KAMPMANN;
    this.init();
    this.infoString = this.getInfo([INFO_KAMPMANN, INFO_ZSCORE, ABBREV_KAMPMANN]);
    this.paramName = "Lvpws";
    this.paramNameLong = "LVPWS";
    this.paramUnit = "mm";
    this.bsa = bsaDuBois(a, b);
    if (this.weight <= 4) {
        this.corValue = this.weight;
        this.grid = new Array(2,2.5,3,3.5,4);
        this.meanArray = new Array(4.5,5,5.1,5.4,5.7);
        this.sdArray = new Array(0.85,1.05,1,1.05,1.1);
        this.errorCondition.push((this.corValue < this.grid[0]));
        this.errorString.push(window.lang.convert("Weight has to be greater than 2 kg"))
    } else {
        this.corValue = this.bsa;
        this.grid = new Array(0.25,0.275,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.75,2);
        this.meanArray = new Array(5.7,5.9,6.3,6.6,6.8,7.3,7.5,8,8,8.2,8.7,9.1,9.5,9.5,10.3,10.7,11,11.5,12,12.8,14.2);
        this.sdArray = new Array(1,1,1.05,1.1,1.15,1.15,1.15,1.15,1.15,1.2,1.3,1.45,1.35,1.35,1.65,1.55,1.45,1.5,1.75,1.65,2.3);
        this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
        this.errorString.push(window.lang.convert("BSA has to be between 0.25 and 2"))
    }
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
kampmannLvpws.prototype = new MeanSdInterpolatedClass();
function koestenbergerTapse(b, a) {
    this.corValue = a || -1;
    this.value = b || -1;
    this.hidePercentile = true;
    this.refString = REF_KOESTENBERGER_TAPSE;
    this.init();
    this.infoString = this.getInfo([INFO_FUNCTION + INFO_KOESTENBERGER_TAPSE, INFO_ZSCORE, ABBREV_KOESTENBERGER]);
    this.paramName = "Tapse";
    this.paramNameLong = "TAPSE";
    this.paramUnit = "cm";
    this.grid = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,24,36,48,60,72,84,96,108,120,132,144,156,168,180,192,204,216);
    this.meanArray = new Array(0.91,1.14,1.14,1.14,1.31,1.31,1.31,1.44,1.44,1.44,1.44,1.44,1.55,1.65,1.74,1.82,1.87,1.9,1.94,1.97,2.01,2.05,2.1,2.14,2.2,2.26,2.33,2.39,2.45,2.47);
    this.sdArray = new Array(0.116667,0.141667,0.141667,0.141667,0.151667,0.151667,0.151667,0.156667,0.156667,0.156667,0.156667,0.156667,0.15,0.145,0.131667,0.128333,0.131667,0.141667,0.15,0.151667,0.143333,0.135,0.135,0.153333,0.171667,0.193333,0.196667,0.205,0.205,0.21);
    this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
    this.errorString.push(window.lang.convert("Age has to be between 0 and 18 years"));
    this.errorCondition.push(typeof (this.corValue) == -1);
    this.errorString.push(window.lang.convert("Age is undefined"));
    this.errorCondition.push(b <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
koestenbergerTapse.prototype = new MeanSdInterpolatedClass();
function koestenbergerMapse(b, a) {
    this.corValue = a || -1;
    this.value = b || -1;
    this.hidePercentile = true;
    this.refString = REF_KOESTENBERGER_MAPSE;
    this.init();
    this.infoString = this.getInfo([INFO_FUNCTION + INFO_KOESTENBERGER_MAPSE, INFO_ZSCORE, ABBREV_KOESTENBERGER]);
    this.paramName = "Mapse";
    this.paramNameLong = "MAPSE";
    this.paramUnit = "cm";
    this.grid = new Array(1,2,3,4,5,6,7,8,9,10,11,12,24,36,48,60,72,84,96,108,120,132,144,156,168,180,192,204,216);
    this.meanArray = new Array(0.57,0.67,0.73,0.77,0.77,0.77,0.84,0.84,0.84,0.91,0.91,0.91,1.07,1.11,1.14,1.2,1.29,1.28,1.29,1.39,1.37,1.37,1.41,1.45,1.45,1.58,1.63,1.61,1.63);
    this.sdArray = new Array(0.093333,0.098333,0.113333,0.103333,0.103333,0.103333,0.106667,0.106667,0.106667,0.106667,0.106667,0.106667,0.101667,0.098333,0.106667,0.14,0.128333,0.105,0.12,0.171667,0.131667,0.088333,0.125,0.128333,0.12,0.13,0.148333,0.156667,0.163333);
    this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
    this.errorString.push(window.lang.convert("Age has to be between 0 and 18 years"));
    this.errorCondition.push(typeof (this.corValue) == -1);
    this.errorString.push(window.lang.convert("Age is undefined"));
    this.errorCondition.push(b <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
koestenbergerMapse.prototype = new MeanSdInterpolatedClass();
function koestenbergerTapsv(b, a) {
    this.corValue = a || -1;
    this.value = b || -1;
    this.hidePercentile = true;
    this.refString = REF_KOESTENBERGER_TAPSV;
    this.init();
    this.infoString = this.getInfo([INFO_FUNCTION + INFO_KOESTENBERGER_TAPSV, INFO_ZSCORE, ABBREV_KOESTENBERGER]);
    this.paramName = "Tapsv";
    this.paramNameLong = "TAPSV";
    this.paramUnit = "cm/s";
    this.grid = new Array(1,2,3,4,5,6,7,8,9,10,11,12,24,36,48,60,72,84,96,108,120,132,144,156,168,180,192,204,216);
    this.meanArray = new Array(7.2,8.5,8.7,9.1,9.8,9.1,9.5,9.7,9.9,10.6,11.1,11,11.4,11.7,12.2,12.3,12.4,12.6,12.7,12.5,12.8,13.1,12.9,13.2,13.3,13.8,14.1,14,14.3);
    this.sdArray = new Array(1.183333,1,1.183333,1.383333,1.7,0.783333,1.133333,1.65,1.733333,1.25,1.5,1.683333,1.333333,1.716667,1.416667,1.433333,1.416667,1.416667,1.45,1.516667,1.2,1.383333,1.766667,1.283333,2.216667,1.65,2,1.933333,1.816667);
    this.errorCondition.push((this.corValue < this.grid[0]) || (this.corValue > this.grid[this.grid.length - 1]));
    this.errorString.push(window.lang.convert("Age has to be between 0 and 18 years"));
    this.errorCondition.push(typeof (this.corValue) == -1);
    this.errorString.push(window.lang.convert("Age is undefined"));
    this.errorCondition.push(b <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
koestenbergerTapsv.prototype = new MeanSdInterpolatedClass();
function koestenbergerMapsv(c, b, a) {
    this.value = c || -1;
    this.hidePercentile = true;
    this.height = a || -1;
    this.weight = b || -1;
    this.refString = REF_KOESTENBERGER_MAPSV;
    this.init();
    this.infoString = this.getInfo([INFO_FUNCTION + INFO_KOESTENBERGER_MAPSV, INFO_ZSCORE, ABBREV_KOESTENBERGER]);
    this.paramName = "Mapsv";
    this.paramNameLong = "MAPSV";
    this.paramUnit = "cm/s";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.corValue = this.bsa;
    this.grid = new Array(0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9);
    this.meanArray = new Array(5.9,6.9,7.3,7.8,8.7,8.5,8.9,9.9,9.5,10.2,10,10.5,11,11.2,11,11.3,11.3,12.1);
    this.sdArray = new Array(1.033333,1.15,1.083333,1.166667,1.1,1.1,1.533333,1.3,1.283333,1.233333,1.483333,1.266667,1.433333,1.183333,1.216667,1.516667,1.35,1.2);
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"));
    this.getLowerAndUpperValues()
}
koestenbergerMapsv.prototype = new MeanSdInterpolatedClass();
function dallaireBasalcs(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE2;
    this.init();
    this.infoString = this.getInfo([INFO_LVSTRAIN + INFO_DALLAIRE2, INFO_ZSCORE]);
    this.paramName = "Basalcs";
    this.paramNameLong = "Basal CS";
    this.paramUnit = "%";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return ((d - (-1.218 * Math.pow(this.bsa, 2) + 2.428 * this.bsa + 18.93)) / (0.158 * this.bsa + 1.64))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return (d * (0.158 * this.bsa + 1.64) + (-1.218 * Math.pow(this.bsa, 2) + 2.428 * this.bsa + 18.93))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireBasalcs.prototype = new LMSClass();
function dallaireMidcs(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE2;
    this.init();
    this.infoString = this.getInfo([INFO_LVSTRAIN + INFO_DALLAIRE2, INFO_ZSCORE]);
    this.paramName = "Midcs";
    this.paramNameLong = "Mid CS";
    this.paramUnit = "%";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return (((1 / d) - (0.000665 * Math.pow(this.bsa, 2) + 0.00003 * this.bsa + 0.0509)) / (0.000437 * this.bsa + 0.0038))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return (1 / (d * (0.000437 * this.bsa + 0.0038) + (0.000665 * Math.pow(this.bsa, 2) + 0.00003 * this.bsa + 0.0509)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireMidcs.prototype = new LMSClass();
function dallaireApicalcs(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE2;
    this.init();
    this.infoString = this.getInfo([INFO_LVSTRAIN + INFO_DALLAIRE2, INFO_ZSCORE]);
    this.paramName = "Apicalcs";
    this.paramNameLong = "Apical CS";
    this.paramUnit = "%";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return ((Math.log(d) - (-0.0128 * Math.pow(this.bsa, 2) + 0.032 * this.bsa + 2.935)) / (0.00238 * this.bsa + 0.104))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return (Math.pow(Math.E, d * (0.00238 * this.bsa + 0.104) + (-0.0128 * Math.pow(this.bsa, 2) + 0.032 * this.bsa + 2.935)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireApicalcs.prototype = new LMSClass();
function dallaireMeanls(c, b, a) {
    this.weight = b || -1;
    this.height = a || -1;
    this.value = c || -1;
    this.hidePercentile = true;
    this.refString = REF_DALLAIRE2;
    this.init();
    this.infoString = this.getInfo([INFO_LVSTRAIN + INFO_DALLAIRE2, INFO_ZSCORE]);
    this.paramName = "Meanls";
    this.paramNameLong = "LS";
    this.paramUnit = "%";
    if (b && a) {
        this.bsa = bsaDuBois(this.height, this.weight)
    } else {
        this.bsa = -1
    }
    this.getZFromValue = function(d) {
        if ((this.bsa > 0) && (this.value > 0)) {
            return ((d - (20.295 * Math.pow(this.bsa, -0.0614))) / (-0.343 * this.bsa + 2.02))
        } else {
            return -100
        }
    }
    ;
    this.getValueFromZ = function(d) {
        if (this.bsa > 0) {
            return (d * (-0.343 * this.bsa + 2.02) + (20.295 * Math.pow(this.bsa, -0.0614)))
        } else {
            return -100
        }
    }
    ;
    this.errorCondition.push((b <= 0) || (a <= 0));
    this.errorString.push(window.lang.convert("Weight and height are needed"));
    this.errorCondition.push(c <= 0);
    this.errorString.push(window.lang.convert(this.paramNameLong) + " " + window.lang.convert("has to be greater than 0"))
}
dallaireMeanls.prototype = new LMSClass();
