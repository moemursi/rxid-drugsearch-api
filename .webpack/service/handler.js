(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./handler.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./common/utils/apiUtil.js":
/*!*********************************!*\
  !*** ./common/utils/apiUtil.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const axios = __webpack_require__(/*! axios */ "axios");

exports.submitRequest = async function(url, headers) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        return axios.get(url, headers).then(response => {
            result.statusCode = response.status;
            result.data = response.data;
            return result;
        });
    } catch (error) {
        console.error(error);
    }
};

/***/ }),

/***/ "./functions/drugSearch/drugSearchCtrl.js":
/*!************************************************!*\
  !*** ./functions/drugSearch/drugSearchCtrl.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const nlmSearch = __webpack_require__(/*! ./services/nlmSearch */ "./functions/drugSearch/services/nlmSearch.js");

// Headers needed for Locked Down APIs
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, X-Api-Key, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

/**
 * Drug Identifier Search Endpoint
 *
 * @param {*} query Required Query Input: Name or NDC
 * @returns {Promise} drug identifiers
 */
module.exports.getDrugIdentifiers = query => {
    return new Promise(async resolve => {
        let resp = {
            results: {
                name: '',
                identifier: {},
            },
            errors: [],
            statusCode: 400
        };

        if (query) {
            let drugName = query.queryStringParameters.drugName;
            if (!drugName) {
                resolve({
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'Drug name parameter is empty!!!'
                    }),
                    headers: headers
                });
            } else {

                let nlmRxImageSuccess = false;
                let nlmDrugDatabaseSuccess = false;

                // Call the NLM Drug Image Search Service
                await nlmSearch
                    .nlmDrugImageSearch(drugName)
                    .then(async response => {
                        resp.results.identifier = {
                            name: drugName,
                            nlmRxImages: response.data
                        };
                        nlmRxImageSuccess = response.success;

                        // Use the RXCUIs from the images to grab
                        // markings from the NLM Discovery Search
                        // service
                        for (let image of resp.results.identifier.nlmRxImages) {
                            await nlmSearch
                                .nlmDataDiscoverySearch(image.rxcui)
                                .then(response => {
                                    image.markings = response.data;
                                    nlmDrugDatabaseSuccess = true;
                                })
                                .catch(error => resp.errors.push(error));
                        }

                    })
                    .catch(error => resp.errors.push(error));

                resolve({
                    statusCode: nlmRxImageSuccess || nlmDrugDatabaseSuccess ? 200 : 400,
                    body: JSON.stringify(nlmRxImageSuccess || nlmDrugDatabaseSuccess ? resp.results : resp.errors),
                    headers: headers
                });
            }

        } else {
            resolve({
                statusCode: 400,
                body: JSON.stringify({ error: 'Query is empty!' }),
                headers: headers
            });
        }
    });
};

/***/ }),

/***/ "./functions/drugSearch/services/nlmSearch.js":
/*!****************************************************!*\
  !*** ./functions/drugSearch/services/nlmSearch.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const apiUtil = __webpack_require__(/*! ../../../common/utils/apiUtil */ "./common/utils/apiUtil.js");

const baseRxImageUrl = 'http://rximage.nlm.nih.gov/api/rximage/1';

const nlmDataDiscoveryUrl =
    'https://datadiscovery.nlm.nih.gov/resource/crzr-uvwg.json?';

/**
 * NLM RxImage returns images per manufacturer of a drug.
 * A name string is required.
 *
 * @param {String} name drug name
 * @returns {Promise} NLM RxImages
 */
module.exports.nlmDrugImageSearch = function(name) {
    return new Promise(async resolve => {
        let result = {
            success: false,
            data: {}
        };

        // Only Process the request if name or ndc exists
        if (name) {
            let nameArg = name ? 'name=' + name : '';

            // Format Request URL
            let identifierSearchUrl = baseRxImageUrl + '/rxbase?' + nameArg;

            await apiUtil
                .submitRequest(identifierSearchUrl)
                .then(response => {
                    if (response.statusCode == 200){
                        result.data = remapImageResults(response.data.nlmRxImages);
                        result.success = true;
                    }
                })
                .catch(error => {
                    resolve({
                        error: error
                    })
                });

            resolve(result);
        }
    });
};

/**
 * NLM Data Discovery returns markings per rxcui provided.
 * A rxcui string is required for this search.
 *
 * @param {String} rxcui rxcui
 * @returns {Promise} drug markings per rxcui
 */
module.exports.nlmDataDiscoverySearch = function(rxcui) {
    return new Promise(async resolve => {
        let result = {
            success: false,
            data: []
        };

        // Only Process the request if name or ndc exists
        if (rxcui) {
            let rxcuiArg = rxcui ? 'rxcui=' + rxcui : '';

            // Format Request URL
            let identifierSearchUrl = nlmDataDiscoveryUrl + rxcuiArg;

            await apiUtil
                .submitRequest(identifierSearchUrl)
                .then(response => {
                    if (response.statusCode == 200) {
                        result.success = true;
                        result.data = remapMarkingResults(response.data);
                    }
                    resolve(result);
                })
                .catch(error => {
                    resolve({
                        error: error
                    })
                });
        } else {
            resolve({
                error: 'RXCUI is required for search.'
            });
        }
    });
};

function remapMarkingResults(data) {
    let markingsCollection = [];

    if (data.length > 0) {
        for (let result of data) {
            markingsCollection.push({
                medicine_name: result.medicine_name,
                marketing_act_code: '',
                ndc9: result.ndc9,
                rxcui: result.rxcui,
                rxstring: result.rxstring,
                rxtty: result.rxtty,
                splIngredients: result.spl_ingredients,
                splStrength: result.spl_strength,
                splColor: result.splColor,
                splColorText: result.splcolor_text,
                splImprint: result.splimprint,
                splShape: result.splshape,
                splShapeText: result.splshape_text,
                splSize: result.splsize
            });
        }
    }

    return markingsCollection;
};

function remapImageResults(data) {
    let imageCollection = [];
    if (data.length > 0) {
        for (let image of data) {
            imageCollection.push({
                rxcui: image.rxcui,
                ndc11: image.ndc11,
                splSetId: image.splSetId,
                splVersion: image.splVersion,
                name: image.name,
                labeler: image.labeler,
                imageUrl: image.imageUrl,
                imageSize: image.imageSize,
                markings: []
            });
        }
    }
    return imageCollection;
};


/***/ }),

/***/ "./handler.js":
/*!********************!*\
  !*** ./handler.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const drugSearch = __webpack_require__(/*! ./functions/drugSearch/drugSearchCtrl */ "./functions/drugSearch/drugSearchCtrl.js");

module.exports.getDrugIdentifiers = async (event) => {
  return drugSearch.getDrugIdentifiers(event);
};


/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ })

/******/ })));
//# sourceMappingURL=handler.js.map