/* eslint-disable no-async-promise-executor */
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
                    if (response.statusCode == 200) {
                        result.data = remapImageResults(
                            response.data.nlmRxImages
                        );
                        result.success = true;
                    }
                })
                .catch(error => {
                    resolve({
                        error: error
                    });
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
                    });
                });
        } else {
            resolve({
                error: 'RXCUI is required for search.'
            });
        }
    });
};

/**
 * Remaps returned NLM markings results to desired format
 *
 * @param {Array} data drug collection
 * @returns {Array} drug markings collection
 */
function remapMarkingResults(data) {
    let markingsCollection = [];

    if (data.length > 0) {
        for (let result of data) {
            markingsCollection.push({
                medicineName: result.medicine_name,
                marketingActCode: '',
                ndc9: result.ndc9,
                rxcui: result.rxcui,
                rxstring: result.rxstring,
                rxtty: result.rxtty,
                ingredients: result.spl_ingredients,
                strength: result.spl_strength,
                color: result.splColor,
                colorText: result.splcolor_text,
                imprint: result.splimprint,
                shape: result.splshape,
                shapeText: result.splshape_text,
                size: result.splsize
            });
        }
    }

    return markingsCollection;
}

/**
 * Remaps returned NLM image results to desired format
 *
 * @param {Array} data drug collection
 * @returns {Array} drug image collection
 */
function remapImageResults(data) {
    let imageCollection = [];
    if (data.length > 0) {
        for (let image of data) {
            imageCollection.push({
                rxcui: image.rxcui,
                ndc11: image.ndc11,
                setId: image.splSetId,
                version: image.splVersion,
                name: image.name,
                labeler: image.labeler,
                imageUrl: image.imageUrl,
                imageSize: image.imageSize,
                markings: []
            });
        }
    }
    return imageCollection;
}
