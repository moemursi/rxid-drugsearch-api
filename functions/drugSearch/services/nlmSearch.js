'use strict';

const apiUtil = require('../../../common/utils/apiUtil');

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
