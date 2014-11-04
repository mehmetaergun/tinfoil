// GLOBAL VARIABLES FOR FUN AND PROFIT
var prefserv = require("sdk/preferences/service");
var simpref = require("sdk/simple-prefs");
var simstor = require("sdk/simple-storage");
var observerArray = [];

// PRIORITIES ("pri") DEFINED: 0. NOT GUI-ACCESSIBLE
//                             1. GUI-ACCESSIBLE
//                             2. SITUATIONAL
simstor.storage.prefArray = [
	{ gbl:"browser.cache.disk.enable", lcl:"browserCacheDiskEnable", set:false, pri:2 },
	{ gbl:"browser.cache.memory.enable", lcl:"browserCacheMemoryEnable", set:true, pri:2 },
	{ gbl:"browser.cache.offline.enable", lcl:"browserCacheOfflineEnable", set:false, pri:2 },
	{ gbl:"browser.newtab.url", lcl:"browserNewtabUrl", set:"about:blank", pri:2 },
	{ gbl:"browser.newtabpage.enabled", lcl:"browserNewtabpageEnabled", set:false, pri:2 },
	{ gbl:"browser.pagethumbnails.capturing_disabled", lcl:"browserThumbnailsDisabled", set:false, pri:0 },
	{ gbl:"browser.safebrowsing.enabled", lcl:"browserSafebrowsingEnabled", set:false, pri:1 },
	{ gbl:"browser.safebrowsing.malware.enabled", lcl:"browserSafebrowsingMalwareEnabled", set:false, pri:1 },
	{ gbl:"browser.search.suggest.enabled", lcl:"browserSearchSuggestEnabled", set:false, pri:1 },
	{ gbl:"browser.send_pings", lcl:"browserSendPings", set:false, pri:0 },
	{ gbl:"browser.startup.page", lcl:"browserStartupPage", set:0, pri:2 },
	{ gbl:"datareporting.healthreport.service.enabled", lcl:"datareportingHealthreportServiceEnabled", set:false, pri:1 },
	{ gbl:"datareporting.healthreport.uploadEnabled", lcl:"datareportingHealthreportUploadEnabled", set:false, pri:1 },
	{ gbl:"dom.event.clipboardevents.enabled", lcl:"domEventClipboardeventsEnabled", set:false, pri:0 },
	{ gbl:"dom.storage.enabled", lcl:"domStorageEnabled", set:false, pri:2 },
	{ gbl:"general.useragent.override", lcl:"generalUseragentOverride", pri:2 },
	{ gbl:"geo.enabled", lcl:"geoEnabled", set:false, pri:0 },
	{ gbl:"network.cookie.cookieBehavior", lcl:"networkCookieCookieBehavior", set:1, pri:1 },
	{ gbl:"network.cookie.lifetimePolicy", lcl:"networkCookieLifetimePolicy", set:1, pri:2 },
	{ gbl:"network.dns.disablePrefetch", lcl:"networkDnsDisablePrefetch", set:true, pri:0 },
	{ gbl:"network.http.referer.spoofSource", lcl:"networkHttpRefererSpoofSource", set:true, pri:0 },
	{ gbl:"network.http.referer.XOriginPolicy", lcl:"networkHttpRefererXOriginPolicy", set:1, pri:0 },
	{ gbl:"network.http.sendRefererHeader", lcl:"networkHttpSendRefererHeader", set:2, pri:0 },
	{ gbl:"network.http.sendSecureXSiteReferrer", lcl:"networkHttpSendSecureXSiteReferrer", set:true, pri:0 },
	{ gbl:"network.prefetch-next", lcl:"networkPrefetchNext", set:false, pri:0 },
	{ gbl:"network.proxy.socks_remote_dns", lcl:"networkProxySocksRemoteDns", set:true, pri:1 },
	{ gbl:"plugin.state.flash", lcl:"pluginStateFlash", set:1, pri:1 },
	{ gbl:"plugins.click_to_play", lcl:"pluginsClickToPlay", set:true, pri:0 },
	{ gbl:"plugins.enumerable_names", lcl:"pluginsEnumerableNames", set:"", pri:0 },
	{ gbl:"privacy.donottrackheader.enabled", lcl:"privacyDonottrackheaderEnabled", set:false, pri:2 },
	{ gbl:"toolkit.telemetry.enabled", lcl:"toolkitTelemetryEnabled", set:false, pri:1 }
]

// LOAD
exports.main = function (options) {

	if(options.loadReason==="install" || options.loadReason==="enable") {

		// CREATE STORAGE ARRAY IF IT DOESN'T EXIST
		if(!simstor.storage.userSet)
			simstor.storage.userSet = [];

		for(var i = 0; i < simstor.storage.prefArray.length; i++) {

			var tmp = simstor.storage.prefArray[i];
			var pref = { name:tmp.gbl, value:prefserv.get(tmp.gbl) };

			// STORE PREINSTALL SETTINGS
			if(prefserv.isSet(tmp.gbl)) {
				simstor.storage.userSet.push(pref);
			}

			// SET PRIORITY SETTINGS
			if(tmp.pri===0) {
				prefserv.set(tmp.gbl, tmp.set);
			}
		}
	}

	// GET CURRENT SETTINGS
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		
		var tmp = simstor.storage.prefArray[i];

		if(tmp.gbl==="plugins.enumerable_names") {
			
			if(prefserv.get(tmp.gbl)==="")
				simpref.prefs[tmp.lcl] = false;
			
			else
				simpref.prefs[tmp.lcl] = true;
		}

		else if(prefserv.has(tmp.gbl))
			simpref.prefs[tmp.lcl] = prefserv.get(tmp.gbl);

		else
			console.log("!has: " + tmp.gbl);
	}

	// GLOBAL PREFERENCES LISTENERS
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {

		const {Cc,Ci} = require("chrome");
		var tmp = simstor.storage.prefArray[i];

		var prefObserver = {

			register: function() {
				var prefService = Cc["@mozilla.org/preferences-service;1"]
									.getService(Ci.nsIPrefService);
				this.branch = prefService.getBranch(tmp.gbl);
				this.branch.addObserver("", this, false);
			},

			unregister: function() {
				this.branch.removeObserver("", this);
			},

			observe: function(aSubject, aTopic, aData) {

				var tmp;
				var startPoint = 0;
				var endPoint = simstor.storage.prefArray.length - 1;
				var found = false;

				while(!found) {
					var midPoint = Math.round((startPoint + endPoint) / 2);
					tmp = simstor.storage.prefArray[midPoint];

					if(aSubject.root.toUpperCase() < tmp.gbl.toUpperCase())
						endPoint = midPoint - 1;
					
					else if(aSubject.root.toUpperCase() > tmp.gbl.toUpperCase())
						startPoint = midPoint + 1;
					
					else
						found = true;
				}

				if(tmp.gbl==="plugins.enumerable_names") {

					if(prefserv.get(tmp.gbl)==="")
						simpref.prefs[tmp.lcl] = false;
					
					else
						simpref.prefs[tmp.lcl] = true;
				}

				else
					simpref.prefs[tmp.lcl] = prefserv.get(tmp.gbl);
			}
		}

		observerArray[i] = prefObserver;
		observerArray[i].register();
	}
};

// SIMPLE-PREFS BUTTON LISTENERS
var sp = require("sdk/simple-prefs");

// "FULL TINFOIL" BUTTON
sp.on("btnFull", function() {
	
	// APPLY INSTALLATION DEFAULTS
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		if(tmp.pri===0)
			prefserv.set(tmp.gbl, tmp.set);
	}

	// APPLY FULL TINFOIL SETTINGS
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		if(tmp.pri===1)
			if(!(tmp.gbl==="plugin.state.flash" && prefserv.get(tmp.gbl)===0))
				prefserv.set(tmp.gbl, tmp.set);
	}
});

// "DEFAULTS" BUTTON
sp.on("btnDefaults", function() {

	// RESET ALL PREFERENCES
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		prefserv.reset(tmp.gbl);
	}

	// RESTORE PRE-INSTALL SETTINGS
	for(var i = 0; i < simstor.storage.userSet.length; i++) {
		var pref = simstor.storage.userSet[i];
		prefserv.set(pref.name, pref.value);
	}

	// RESTORE INSTALLATION DEFAULTS
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		if(tmp.pri===0)
			prefserv.set(tmp.gbl, tmp.set);
	}
});

// "RESTORE" BUTTON
sp.on("btnRestore", function() {

	// RESET ALL PREFERENCES
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		prefserv.reset(tmp.gbl);
	}

	// RESTORE PRE-INSTALL SETTINGS
	for(var i = 0; i < simstor.storage.userSet.length; i++) {
		var pref = simstor.storage.userSet[i];
		prefserv.set(pref.name, pref.value);
	}
});

// "RESET" BUTTON
sp.on("btnReset", function() {

	// RESET ALL PREFERENCES
	for(var i = 0; i < simstor.storage.prefArray.length; i++) {
		var tmp = simstor.storage.prefArray[i];
		prefserv.reset(tmp.gbl);
	}
});

function binarySearch(prefName, startPoint, endPoint) {
	var midPoint = Math.round((startPoint + endPoint) / 2);
	var tmp = simstor.storage.prefArray[midPoint];

	if (prefName === tmp.lcl)
		return tmp;
	else if (prefName < tmp.lcl)
		return binarySearch(prefName, startPoint, midPoint - 1);
	else
		return binarySearch(prefName, midPoint + 1, endPoint);
}

function onPrefChange(prefName) {

	if(prefName==="pluginsEnumerableNames") {

		if(simpref.prefs[prefName]===false)
			prefserv.set("plugins.enumerable_names", "");
		
		else
			prefserv.reset("plugins.enumerable_names");
	}
	
	else if(prefName==="generalUseragentOverride") {
		
		if(simpref.prefs[prefName]==="")
			prefserv.reset("general.useragent.override");
		
		else
			prefserv.set("general.useragent.override", simpref.prefs[prefName]);
	}

	else if(prefName==="browserThumbnailsDisabled") {
		prefserv.set("browser.pagethumbnails.capturing_disabled", simpref.prefs[prefName]);
	}

	else if(prefName != "keepSettings") {
		var tmp = binarySearch(prefName, 0, simstor.storage.prefArray.length - 1);
		prefserv.set(tmp.gbl, simpref.prefs[prefName]);
	}
}

// LOCAL PREFERENCE CHANGE EVENT LISTENER
simpref.on("", onPrefChange);

// UNLOAD
exports.onUnload = function (reason) {
	
	if(reason==="uninstall" || reason==="disable") {

		// UNREGISTER LISTENERS
		for(var i = 0; i < simstor.storage.prefArray.length; i++) {
			observerArray[i].unregister();
		}

		if(!keepSettings) {

			// RESET ALL PREFERENCES
			for(var i = 0; i < simstor.storage.prefArray.length; i++) {
				var tmp = simstor.storage.prefArray[i];
				prefserv.reset(tmp.gbl);
			}

			// RESTORE PREFERENCES TO BEFORE INSTALLATION
			while(simstor.storage.userSet.length > 0) {
				var pref = simstor.storage.userSet.pop();
				prefserv.set(pref.name, pref.value);
			}
		}
	}
};