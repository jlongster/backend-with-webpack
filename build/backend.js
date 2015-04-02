require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 				var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 				hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 			}
/******/
/******/ 			function hotDownloadManifest(callback) {
/******/ 				try {
/******/ 					var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 				} catch(e) {
/******/ 					return callback();
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		
/******/
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "2eb9df487bedc3d1aed0";
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = [];
/******/
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				fn[name] = __webpack_require__[name];
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		}
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 				else for(var i = 0; i < dep.length; i++)
/******/ 					hot._acceptedDependencies[dep[i]] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else for(var i = 0; i < dep.length; i++)
/******/ 					hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			quiet: true,
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0; {
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(+id);
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) { if(err) throw err };
/******/ 		}
/******/ 		
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 			
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 			
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = +id;
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j]
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(12);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__resourceQuery) {/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	if(true) {
		function checkForUpdate(fromUpdate) {
			module.hot.check(function(err, updatedModules) {
				if(err) {
					if(module.hot.status() in {abort:1,fail:1}) {
						console.warn("[HMR] Cannot apply update.");
						console.warn("[HMR] " + err.stack || err.message);
						console.warn("[HMR] You need to restart the application!");
					} else {
						console.warn("[HMR] Update failed: " + err.stack || err.message);
					}
					return;
				}
	            console.log(updatedModules);
				if(!updatedModules) {
				    if(fromUpdate) {
					    if(!module.hot.quiet)
						    console.log("[HMR] Update applied.");
	                }
					else {
						console.warn("[HMR] Cannot find update.");
	                }
					return;
				}
	
				module.hot.apply({
					ignoreUnaccepted: true
				}, function(err, renewedModules) {
					if(err) {
						if(module.hot.status() in {abort:1,fail:1}) {
							console.warn("[HMR] Cannot apply update (Need to do a full reload!)");
							console.warn("[HMR] " + err.stack || err.message);
							console.warn("[HMR] You need to restart the application!");
						} else {
							console.warn("[HMR] Update failed: " + err.stack || err.message);
						}
						return;
					}
	
					__webpack_require__(3)(updatedModules, renewedModules);
	
					checkForUpdate(true);
				});
			});
		}
	
		process.on(__resourceQuery.substr(1) || "SIGUSR2", function() {
			if(module.hot.status() !== "idle") {
				console.warn("[HMR] Got signal but currently in " + module.hot.status() + " state.");
				console.warn("[HMR] Need to be in idle state to start hot update.");
				return;
			}
	
			checkForUpdate();
		});
	} else {
		throw new Error("[HMR] Hot Module Replacement is disabled.");
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, ""))

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(updatedModules, renewedModules) {
		if(module.hot.quiet) {
			return;
		}
	
		var unacceptedModules = updatedModules.filter(function(moduleId) {
			return renewedModules && renewedModules.indexOf(moduleId) < 0;
		});
	
		if(unacceptedModules.length > 0) {
			console.warn("[HMR] The following modules couldn't be hot updated: (They would need a full reload!)");
			unacceptedModules.forEach(function(moduleId) {
				console.warn("[HMR] - " + moduleId);
			});
		}
	
		if(!renewedModules || renewedModules.length === 0) {
			console.log("[HMR] Nothing hot updated.");
		} else {
			console.log("[HMR] Updated modules:");
			renewedModules.forEach(function(moduleId) {
				console.log("[HMR] - " + moduleId);
			});
		}
	};


/***/ },
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("path");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("http");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("express");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("socket.io");

/***/ },
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("transducers.js");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var server = _interopRequire(__webpack_require__(13));
	
	console.log("Listening on port 4000...");
	server.listen(4000);
	
	/* HOT PATCH LOADER */ var __moduleBindings = []; if(true) {
	  module.hot.accept(function(err) {
	    console.log('[HMR] Error accepting: ' + err);
	  });

	  var getEvalSource = function(func) {
	    var code = func.toString();
	    var m = code.match(/^function\s+__eval\s*\((.*)\)\s*\{([\s\S]*)\}$/i);
	    if(!m) {
	      return null;
	    }
	    var args = m[1];
	    var body = m[2];
	    var scope = {};

	    if(args.trim()) {
	      args.split(',').forEach(function(arg) {
	        if(arg.indexOf('=') !== -1) {
	          var p = arg.split('=');
	          scope[p[0].trim()] = JSON.parse(p[1]);
	        }
	        else {
	          scope[arg.trim()] = undefined;
	        }
	      });
	    }

	    return { body: body, scope: scope };
	  }

	  var injectScope = function(scope, code) {
	    // Take an explicit scope object and inject it so that
	    // `code` runs in context of it
	    var injected = Object.keys(scope).map(function(binding) {
	      return 'var ' + binding + ' = evalScope.' + binding + ';'
	    }).join(' ');

	    // Update our scope object with any modifications
	    var extracted = Object.keys(scope).map(function(binding) {
	      return 'evalScope.' + binding + ' = ' + binding + ';';
	    }).join(' ');

	    return injected + code + extracted;
	  }

	  var bindings = __moduleBindings;

	  if(!module.hot.data) {
	    // First time loading. Try and patch something.
	    var patchedBindings = {};
	    var evalScope = {};

	    var moduleEvalWithScope = function(frame) {
	      // Update the scope to reflect only the values specified as
	      // arguments to the __eval function. Copy over values from the
	      // existing scope and ignore the rest.
	      Object.keys(evalScope).forEach(function(arg) {
	        if(arg in frame.scope) {
	          frame.scope[arg] = evalScope[arg];
	        }
	      });
	      evalScope = frame.scope;

	      var code = injectScope(evalScope, frame.body);
	      return eval(code);
	    }

	    var moduleEval = function(code) {
	      return eval(code);
	    }

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        var patched = function() {
	          if(patchedBindings[binding]) {
	            return patchedBindings[binding].apply(this, arguments);
	          }
	          else {
	            return f.apply(this, arguments);
	          }
	        };
	        patched.prototype = f.prototype;

	        eval(binding + ' = patched;\n');

	        if(module.exports[binding]) {
	          module.exports[binding] = patched;
	        }
	      }
	    });

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = moduleEval;
	      data.moduleEvalWithScope = moduleEvalWithScope;
	    });
	  }
	  else {
	    var patchedBindings = module.hot.data.patchedBindings;

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        // We need to reify the function in the original module so
	        // it references any of the original state. Strip the name
	        // and simply eval it.
	        var funcCode = (
	          '(' + f.toString().replace(/^function \w+\(/, 'function (') + ')'
	        );
	        patchedBindings[binding] = module.hot.data.moduleEval(funcCode);
	      }
	    });

	    if(typeof __eval === 'function') {
	      try {
	        module.hot.data.moduleEvalWithScope(getEvalSource(__eval));
	      }
	      catch(e) {
	        console.log('error evaling: ' + e);
	      }
	    }

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = module.hot.data.moduleEval;
	      data.moduleEvalWithScope = module.hot.data.moduleEvalWithScope;
	    });
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var path = _interopRequire(__webpack_require__(5));
	
	var http = _interopRequire(__webpack_require__(6));
	
	var express = _interopRequire(__webpack_require__(7));
	
	var socketio = _interopRequire(__webpack_require__(8));
	
	var index = _interopRequire(__webpack_require__(14));
	
	var page = _interopRequire(__webpack_require__(15));
	
	var app = express();
	app.use(express["static"](path.join(__dirname, "../static")));
	
	var server = http.createServer(app);
	var io = socketio(server);
	
	function broadcastFrom(socket, point) {
	  var data = {
	    color: socket.color,
	    point: point,
	    lastPoint: socket.lastPoint
	  };
	  socket.broadcast.emit("data", data);
	  socket.emit("data", data);
	  socket.lastPoint = point;
	}
	
	function getColor() {
	  return "rgb(" + (Math.random() * 150 + 105 | 0) + "," + (Math.random() * 150 + 105 | 0) + "," + (Math.random() * 150 + 105 | 0) + ")";
	}
	
	var sockets = [];
	io.on("connection", function (socket) {
	  sockets.push(socket);
	  socket.color = getColor();
	
	  socket.on("data", function (msg) {
	    broadcastFrom(socket, msg);
	  });
	
	  socket.on("disconnect", function () {
	    sockets = sockets.filter(function (s) {
	      return s !== socket;
	    });
	  });
	});
	
	function __eval() {}
	
	module.exports = server;
	
	// sockets.forEach((s, i) => {
	//   s.color = getColor();
	//   console.log('socket' + i, s.color);
	// });

	/* HOT PATCH LOADER */ var __moduleBindings = ["broadcastFrom","getColor","__eval"]; if(true) {
	  module.hot.accept(function(err) {
	    console.log('[HMR] Error accepting: ' + err);
	  });

	  var getEvalSource = function(func) {
	    var code = func.toString();
	    var m = code.match(/^function\s+__eval\s*\((.*)\)\s*\{([\s\S]*)\}$/i);
	    if(!m) {
	      return null;
	    }
	    var args = m[1];
	    var body = m[2];
	    var scope = {};

	    if(args.trim()) {
	      args.split(',').forEach(function(arg) {
	        if(arg.indexOf('=') !== -1) {
	          var p = arg.split('=');
	          scope[p[0].trim()] = JSON.parse(p[1]);
	        }
	        else {
	          scope[arg.trim()] = undefined;
	        }
	      });
	    }

	    return { body: body, scope: scope };
	  }

	  var injectScope = function(scope, code) {
	    // Take an explicit scope object and inject it so that
	    // `code` runs in context of it
	    var injected = Object.keys(scope).map(function(binding) {
	      return 'var ' + binding + ' = evalScope.' + binding + ';'
	    }).join(' ');

	    // Update our scope object with any modifications
	    var extracted = Object.keys(scope).map(function(binding) {
	      return 'evalScope.' + binding + ' = ' + binding + ';';
	    }).join(' ');

	    return injected + code + extracted;
	  }

	  var bindings = __moduleBindings;

	  if(!module.hot.data) {
	    // First time loading. Try and patch something.
	    var patchedBindings = {};
	    var evalScope = {};

	    var moduleEvalWithScope = function(frame) {
	      // Update the scope to reflect only the values specified as
	      // arguments to the __eval function. Copy over values from the
	      // existing scope and ignore the rest.
	      Object.keys(evalScope).forEach(function(arg) {
	        if(arg in frame.scope) {
	          frame.scope[arg] = evalScope[arg];
	        }
	      });
	      evalScope = frame.scope;

	      var code = injectScope(evalScope, frame.body);
	      return eval(code);
	    }

	    var moduleEval = function(code) {
	      return eval(code);
	    }

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        var patched = function() {
	          if(patchedBindings[binding]) {
	            return patchedBindings[binding].apply(this, arguments);
	          }
	          else {
	            return f.apply(this, arguments);
	          }
	        };
	        patched.prototype = f.prototype;

	        eval(binding + ' = patched;\n');

	        if(module.exports[binding]) {
	          module.exports[binding] = patched;
	        }
	      }
	    });

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = moduleEval;
	      data.moduleEvalWithScope = moduleEvalWithScope;
	    });
	  }
	  else {
	    var patchedBindings = module.hot.data.patchedBindings;

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        // We need to reify the function in the original module so
	        // it references any of the original state. Strip the name
	        // and simply eval it.
	        var funcCode = (
	          '(' + f.toString().replace(/^function \w+\(/, 'function (') + ')'
	        );
	        patchedBindings[binding] = module.hot.data.moduleEval(funcCode);
	      }
	    });

	    if(typeof __eval === 'function') {
	      try {
	        module.hot.data.moduleEvalWithScope(getEvalSource(__eval));
	      }
	      catch(e) {
	        console.log('error evaling: ' + e);
	      }
	    }

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = module.hot.data.moduleEval;
	      data.moduleEvalWithScope = module.hot.data.moduleEvalWithScope;
	    });
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, "src"))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var t = _interopRequire(__webpack_require__(11));
	
	module.exports = function (req, res) {
	  var arr = JSON.parse(req.query.arr || "[]");
	  res.send(t.map(arr, function (x) {
	    return x + 1;
	  }));
	};
	
	/* HOT PATCH LOADER */ var __moduleBindings = []; if(true) {
	  module.hot.accept(function(err) {
	    console.log('[HMR] Error accepting: ' + err);
	  });

	  var getEvalSource = function(func) {
	    var code = func.toString();
	    var m = code.match(/^function\s+__eval\s*\((.*)\)\s*\{([\s\S]*)\}$/i);
	    if(!m) {
	      return null;
	    }
	    var args = m[1];
	    var body = m[2];
	    var scope = {};

	    if(args.trim()) {
	      args.split(',').forEach(function(arg) {
	        if(arg.indexOf('=') !== -1) {
	          var p = arg.split('=');
	          scope[p[0].trim()] = JSON.parse(p[1]);
	        }
	        else {
	          scope[arg.trim()] = undefined;
	        }
	      });
	    }

	    return { body: body, scope: scope };
	  }

	  var injectScope = function(scope, code) {
	    // Take an explicit scope object and inject it so that
	    // `code` runs in context of it
	    var injected = Object.keys(scope).map(function(binding) {
	      return 'var ' + binding + ' = evalScope.' + binding + ';'
	    }).join(' ');

	    // Update our scope object with any modifications
	    var extracted = Object.keys(scope).map(function(binding) {
	      return 'evalScope.' + binding + ' = ' + binding + ';';
	    }).join(' ');

	    return injected + code + extracted;
	  }

	  var bindings = __moduleBindings;

	  if(!module.hot.data) {
	    // First time loading. Try and patch something.
	    var patchedBindings = {};
	    var evalScope = {};

	    var moduleEvalWithScope = function(frame) {
	      // Update the scope to reflect only the values specified as
	      // arguments to the __eval function. Copy over values from the
	      // existing scope and ignore the rest.
	      Object.keys(evalScope).forEach(function(arg) {
	        if(arg in frame.scope) {
	          frame.scope[arg] = evalScope[arg];
	        }
	      });
	      evalScope = frame.scope;

	      var code = injectScope(evalScope, frame.body);
	      return eval(code);
	    }

	    var moduleEval = function(code) {
	      return eval(code);
	    }

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        var patched = function() {
	          if(patchedBindings[binding]) {
	            return patchedBindings[binding].apply(this, arguments);
	          }
	          else {
	            return f.apply(this, arguments);
	          }
	        };
	        patched.prototype = f.prototype;

	        eval(binding + ' = patched;\n');

	        if(module.exports[binding]) {
	          module.exports[binding] = patched;
	        }
	      }
	    });

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = moduleEval;
	      data.moduleEvalWithScope = moduleEvalWithScope;
	    });
	  }
	  else {
	    var patchedBindings = module.hot.data.patchedBindings;

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        // We need to reify the function in the original module so
	        // it references any of the original state. Strip the name
	        // and simply eval it.
	        var funcCode = (
	          '(' + f.toString().replace(/^function \w+\(/, 'function (') + ')'
	        );
	        patchedBindings[binding] = module.hot.data.moduleEval(funcCode);
	      }
	    });

	    if(typeof __eval === 'function') {
	      try {
	        module.hot.data.moduleEvalWithScope(getEvalSource(__eval));
	      }
	      catch(e) {
	        console.log('error evaling: ' + e);
	      }
	    }

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = module.hot.data.moduleEval;
	      data.moduleEvalWithScope = module.hot.data.moduleEvalWithScope;
	    });
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (req, res) {
	  res.send("page");
	};
	
	/* HOT PATCH LOADER */ var __moduleBindings = []; if(true) {
	  module.hot.accept(function(err) {
	    console.log('[HMR] Error accepting: ' + err);
	  });

	  var getEvalSource = function(func) {
	    var code = func.toString();
	    var m = code.match(/^function\s+__eval\s*\((.*)\)\s*\{([\s\S]*)\}$/i);
	    if(!m) {
	      return null;
	    }
	    var args = m[1];
	    var body = m[2];
	    var scope = {};

	    if(args.trim()) {
	      args.split(',').forEach(function(arg) {
	        if(arg.indexOf('=') !== -1) {
	          var p = arg.split('=');
	          scope[p[0].trim()] = JSON.parse(p[1]);
	        }
	        else {
	          scope[arg.trim()] = undefined;
	        }
	      });
	    }

	    return { body: body, scope: scope };
	  }

	  var injectScope = function(scope, code) {
	    // Take an explicit scope object and inject it so that
	    // `code` runs in context of it
	    var injected = Object.keys(scope).map(function(binding) {
	      return 'var ' + binding + ' = evalScope.' + binding + ';'
	    }).join(' ');

	    // Update our scope object with any modifications
	    var extracted = Object.keys(scope).map(function(binding) {
	      return 'evalScope.' + binding + ' = ' + binding + ';';
	    }).join(' ');

	    return injected + code + extracted;
	  }

	  var bindings = __moduleBindings;

	  if(!module.hot.data) {
	    // First time loading. Try and patch something.
	    var patchedBindings = {};
	    var evalScope = {};

	    var moduleEvalWithScope = function(frame) {
	      // Update the scope to reflect only the values specified as
	      // arguments to the __eval function. Copy over values from the
	      // existing scope and ignore the rest.
	      Object.keys(evalScope).forEach(function(arg) {
	        if(arg in frame.scope) {
	          frame.scope[arg] = evalScope[arg];
	        }
	      });
	      evalScope = frame.scope;

	      var code = injectScope(evalScope, frame.body);
	      return eval(code);
	    }

	    var moduleEval = function(code) {
	      return eval(code);
	    }

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        var patched = function() {
	          if(patchedBindings[binding]) {
	            return patchedBindings[binding].apply(this, arguments);
	          }
	          else {
	            return f.apply(this, arguments);
	          }
	        };
	        patched.prototype = f.prototype;

	        eval(binding + ' = patched;\n');

	        if(module.exports[binding]) {
	          module.exports[binding] = patched;
	        }
	      }
	    });

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = moduleEval;
	      data.moduleEvalWithScope = moduleEvalWithScope;
	    });
	  }
	  else {
	    var patchedBindings = module.hot.data.patchedBindings;

	    bindings.forEach(function(binding) {
	      var f = eval(binding);

	      if(typeof f === 'function' && binding !== '__eval') {
	        // We need to reify the function in the original module so
	        // it references any of the original state. Strip the name
	        // and simply eval it.
	        var funcCode = (
	          '(' + f.toString().replace(/^function \w+\(/, 'function (') + ')'
	        );
	        patchedBindings[binding] = module.hot.data.moduleEval(funcCode);
	      }
	    });

	    if(typeof __eval === 'function') {
	      try {
	        module.hot.data.moduleEvalWithScope(getEvalSource(__eval));
	      }
	      catch(e) {
	        console.log('error evaling: ' + e);
	      }
	    }

	    module.hot.dispose(function(data) {
	      data.patchedBindings = patchedBindings;
	      data.moduleEval = module.hot.data.moduleEval;
	      data.moduleEvalWithScope = module.hot.data.moduleEvalWithScope;
	    });
	  }
	}


/***/ }
/******/ ]);
//# sourceMappingURL=backend.js.map