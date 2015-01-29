// GLOBAL VARIABLES FOR FUN AND PROFIT
var prefserv = require("sdk/preferences/service");
var simpref = require("sdk/simple-prefs");
var simstor = require("sdk/simple-storage");
var observerArray = [];

// PREFERENCE ARRAY FOR JUSTICE
simstor.storage.prefArray = [
{ name:"browser.cache.disk.enable", set:false, pri:2 },
{ name:"browser.cache.memory.enable", set:true, pri:2 },
{ name:"browser.cache.offline.enable", set:false, pri:2 },
{ name:"browser.newtab.url", set:"about:blank", pri:2 },
{ name:"browser.newtabpage.directory.ping", set:"", pri:1 },
{ name:"browser.newtabpage.directory.source", set:"data:application/json,{}", pri:1 },
{ name:"browser.newtabpage.enabled", set:false, pri:2 },
{ name:"browser.newtabpage.enhanced", set:false, pri:1 },
{ name:"browser.pagethumbnails.capturing_disabled", set:true, pri:1 },
{ name:"browser.safebrowsing.enabled", set:false, pri:1 },
{ name:"browser.safebrowsing.malware.enabled", set:false, pri:1 },
{ name:"browser.search.suggest.enabled", set:false, pri:1 },
{ name:"browser.send_pings", set:false, pri:0 },
{ name:"datareporting.healthreport.service.enabled", set:false, pri:1 },
{ name:"datareporting.healthreport.uploadEnabled", set:false, pri:1 },
{ name:"datareporting.policy.dataSubmissionEnabled", set:false, pri:1 },
{ name:"dom.event.clipboardevents.enabled", set:false, pri:1 },
{ name:"dom.ipc.plugins.flash.subprocess.crashreporter.enabled", set:false, pri:0 },
{ name:"dom.storage.enabled", set:false, pri:1 },
{ name:"geo.enabled", set:false, pri:0 },
{ name:"media.gmp-gmpopenh264.enabled", set:false, pri:1 },
{ name:"media.peerconnection.enabled", set:false, pri:1 },
{ name:"network.cookie.cookieBehavior", set:1, pri:0 },
{ name:"network.cookie.lifetimePolicy", set:1, pri:2 },
{ name:"network.dns.disablePrefetch", set:true, pri:0 },
{ name:"network.http.referer.XOriginPolicy", set:1, pri:0 },
{ name:"network.http.referer.spoofSource", set:true, pri:0 },
{ name:"network.http.sendRefererHeader", set:2, pri:0 },
{ name:"network.http.sendSecureXSiteReferrer", set:true, pri:0 },
{ name:"network.prefetch-next", set:false, pri:0 },
{ name:"network.proxy.socks_remote_dns", set:true, pri:1 },
{ name:"plugin.state.flash", set:1, pri:1 },
{ name:"plugins.click_to_play", set:true, pri:0 },
{ name:"plugins.enumerable_names", set:"", pri:0 },
{ name:"privacy.donottrackheader.enabled", set:false, pri:1 },
{ name:"toolkit.telemetry.enabled", set:false, pri:0 }
];

// LOAD
exports.main = function (options) {

	var pref, tmp;

	if(options.loadReason==="install" || options.loadReason==="enable") {

		// CREATE STORAGE ARRAY IF IT DOESN'T EXIST
		if(!simstor.storage.userSet)
			simstor.storage.userSet = [];

			for(i = 0; i < simstor.storage.prefArray.length; i++) {

				tmp = simstor.storage.prefArray[i];
				pref = { name:tmp.name, value:prefserv.get(tmp.name) };

				// STORE PREINSTALL SETTINGS
				if(prefserv.isSet(tmp.name)) {
					simstor.storage.userSet.push(pref);
				}

				// SET PRIORITY SETTINGS
				if(tmp.pri===0) {
					prefserv.set(tmp.name, tmp.set);
				}
			}
		}

		// GET CURRENT SETTINGS
		for(i = 0; i < simstor.storage.prefArray.length; i++) {

			tmp = simstor.storage.prefArray[i];

			if(tmp.name==="browser.newtabpage.directory.ping" ||
				tmp.name==="plugins.enumerable_names") {

					if(prefserv.get(tmp.name)==="")
						simpref.prefs[tmp.name] = false;

						else
							simpref.prefs[tmp.name] = true;
						}

						else if(tmp.name==="browser.newtabpage.directory.source") {

							if(prefserv.get(tmp.name)==="data:application/json,{}")
								simpref.prefs[tmp.name] = false;

								else
									simpref.prefs[tmp.name] = true;
								}

								else if(prefserv.has(tmp.name))
									simpref.prefs[tmp.name] = prefserv.get(tmp.name);
								}

								// GLOBAL PREFERENCES LISTENERS
								for( 0; i < simstor.storage.prefArray.length; i++) {

									const {Cc,Ci} = require("chrome");
									tmp = simstor.storage.prefArray[i];

									var prefObserver = {

										register: function() {
											var prefService = Cc["@mozilla.org/preferences-service;1"]
											.getService(Ci.nsIPrefService);
											this.branch = prefService.getBranch(tmp.name);
											this.branch.addObserver("", this, false);
										},

										unregister: function() {
											this.branch.removeObserver("", this);
										},

										observe: function(aSubject, aTopic, aData) {
											var midPoint, tmp;
											var startPoint = 0;
											var endPoint = simstor.storage.prefArray.length - 1;
											var found = false;

											while(!found) {
												midPoint = Math.round((startPoint + endPoint) / 2);
												tmp = simstor.storage.prefArray[midPoint];

												if(aSubject.root < tmp.name)
													endPoint = midPoint - 1;

													else if(aSubject.root > tmp.name)
														startPoint = midPoint + 1;

														else
															found = true;
														}

														if(tmp.name==="plugins.enumerable_names") {

															if(prefserv.get(tmp.name)==="")
																simpref.prefs[tmp.name] = false;

																else
																	simpref.prefs[tmp.name] = true;
																}

																else if(tmp.name==="browser.newtabpage.directory.ping") {

																	if(prefserv.get(tmp.name)==="")
																		simpref.prefs[tmp.name] = false;

																		else
																			simpref.prefs[tmp.name] = true;
																		}

																		else if(tmp.name==="browser.newtabpage.directory.source") {

																			if(prefserv.get(tmp.name)==="data:application/json,{}")
																				simpref.prefs[tmp.name] = false;

																				else
																					simpref.prefs[tmp.name] = true;
																				}

																				else
																					simpref.prefs[tmp.name] = prefserv.get(tmp.name);

																					console.log("OBSERVER: " + tmp.name);
																				}
																			};

																			observerArray[i] = prefObserver;
																			observerArray[i].register();
																		}
																	};

																	// SIMPLE-PREFS BUTTON LISTENERS
																	var sp = require("sdk/simple-prefs");

																	// "FULL TINFOIL" BUTTON
																	simpref.on("btnFull", function() {

																		var tmp;

																		// APPLY INSTALLATION DEFAULTS
																		for(i = 0; i < simstor.storage.prefArray.length; i++) {
																			tmp = simstor.storage.prefArray[i];
																			if(tmp.pri===0)
																				prefserv.set(tmp.name, tmp.set);
																			}

																			// APPLY FULL TINFOIL SETTINGS
																			for(i = 0; i < simstor.storage.prefArray.length; i++) {
																				tmp = simstor.storage.prefArray[i];
																				if(tmp.pri===1)
																					if(prefserv.get(tmp.name)!==0)
																						prefserv.set(tmp.name, tmp.set);
																					}
																				});

																				// "DEFAULTS" BUTTON
																				simpref.on("btnDefaults", function() {

																					var pref, tmp;

																					// RESET ALL PREFERENCES
																					for(i = 0; i < simstor.storage.prefArray.length; i++) {
																						tmp = simstor.storage.prefArray[i];
																						prefserv.reset(tmp.name);
																					}

																					// RESTORE PRE-INSTALL SETTINGS
																					for(i = 0; i < simstor.storage.userSet.length; i++) {
																						pref = simstor.storage.userSet[i];
																						prefserv.set(pref.name, pref.value);
																					}

																					// RESTORE INSTALLATION DEFAULTS
																					for(i = 0; i < simstor.storage.prefArray.length; i++) {
																						tmp = simstor.storage.prefArray[i];
																						if(tmp.pri===0)
																							prefserv.set(tmp.name, tmp.set);
																						}
																					});

																					// "RESTORE" BUTTON
																					simpref.on("btnRestore", function() {

																						var pref, tmp;

																						// RESET ALL PREFERENCES
																						for(i = 0; i < simstor.storage.prefArray.length; i++) {
																							tmp = simstor.storage.prefArray[i];
																							prefserv.reset(tmp.name);
																						}

																						// RESTORE PRE-INSTALL SETTINGS
																						for(i = 0; i < simstor.storage.userSet.length; i++) {
																							pref = simstor.storage.userSet[i];
																							prefserv.set(pref.name, pref.value);
																						}
																					});

																					// "RESET" BUTTON
																					simpref.on("btnReset", function() {

																						var tmp;

																						// RESET ALL PREFERENCES
																						for(i = 0; i < simstor.storage.prefArray.length; i++) {
																							tmp = simstor.storage.prefArray[i];
																							prefserv.reset(tmp.name);
																						}
																					});

																					function binarySearch(prefName, startPoint, endPoint) {
																						var midPoint = Math.round((startPoint + endPoint) / 2);
																						var tmp = simstor.storage.prefArray[midPoint];
																						if (prefName === tmp.name)
																							return tmp;
																							else if (prefName < tmp.name)
																								return binarySearch(prefName, startPoint, midPoint - 1);
																								else
																									return binarySearch(prefName, midPoint + 1, endPoint);
																								}

																								function onPrefChange(prefName) {
																									if(prefName != "keepSettings") {
																										var tmp = binarySearch(prefName, 0, simstor.storage.prefArray.length - 1);
																										if(prefName==="browser.newtabpage.directory.ping" ||
																											prefName==="browser.newtabpage.directory.source" ||
																											prefName==="plugins.enumerable_names")
																											if(simpref.prefs[prefName]===false)
																												prefserv.set(tmp.name, tmp.set);
																												else
																													prefserv.reset(tmp.name);
																													else
																														prefserv.set(tmp.name, simpref.prefs[prefName]);
																													}

																													console.log("ONPREFCHANGE: " + prefName);
																												}

																												// LOCAL PREFERENCE CHANGE EVENT LISTENER
																												simpref.on("", onPrefChange);

																												// UNLOAD
																												exports.onUnload = function (reason) {

																													if(reason==="uninstall" || reason==="disable") {

																														var pref, tmp;

																														// UNREGISTER LISTENERS
																														for(i = 0; i < simstor.storage.prefArray.length; i++) {
																															observerArray[i].unregister();
																														}

																														if(!keepSettings) {

																															// RESET ALL PREFERENCES
																															for(i = 0; i < simstor.storage.prefArray.length; i++) {
																																tmp = simstor.storage.prefArray[i];
																																prefserv.reset(tmp.name);
																															}

																															// RESTORE PREFERENCES TO BEFORE INSTALLATION
																															while(simstor.storage.userSet.length > 0) {
																																pref = simstor.storage.userSet.pop();
																																prefserv.set(pref.name, pref.value);
																															}
																														}
																													}
																												};
