/* eslint-disable no-async-promise-executor */
'use strict';

const apiUtil = require('../../../common/utils/apiUtil');

const openFdaBaseUrl = 'https://api.fda.gov/drug/';

const API_KEY = '3OJcq7wHXHQd96a2Dyjlx7mMiCBGcVFwRybezjlk';

/**
 * Open FDA Drug Labels Search returns mechanism of action, adverse affects,
 * and all patient labeling criteria from SPL data.
 *
 * @param {String} name drug name
 * @returns {Promise} FDA Drug Labels
 */
module.exports.searchOpenFdaDrugLabelsPromise = function(name) {
    return new Promise(async resolve => {
        let result = {
            success: false,
            statusCode: 500,
            data: {}
        };

        // Only Process the request if name or ndc exists
        if (name) {
            console.log(name);

            // Format Request URL
            let identifierSearchUrl = `${openFdaBaseUrl}label.json?api_key=${API_KEY}&search=${name}`;

            let headers = {
                'content-type': 'application/json; charset=utf-8',
                Accept: 'application/json'
            };

            await apiUtil
                .submitRequest(identifierSearchUrl, { headers: headers })
                .then(response => {
                    result.success = response.statusCode == 200 ? true : false;
                    result.data = response.data;
                    result.statusCode = response.statusCode;
                })
                .catch(error => {
                    console.log(error);
                });

            resolve(result);
        }
    });
};

/**
 * Open FDA Drug NDC Search returns drug class and brand + generic
 * drug information plus some additional identificaiton data.
 *
 * @param {String} name Generic or Brand
 * @returns {Promise} open FDA NDC information
 */
module.exports.searchOpenFdaDrugNDCPromise = function(name) {
    return new Promise(async resolve => {
        let result = {
            success: false,
            statusCode: 500,
            data: {}
        };

        // Only Process the request if name or ndc exists
        if (name) {
            let searchArg = name
                ? '(brand_name:' +
                  name +
                  '+OR+generic_name:' +
                  name +
                  ')' +
                  name
                : '';

            // Format Request URL
            let identifierSearchUrl = `${openFdaBaseUrl}ndc.json?api_key=${API_KEY}&search=${searchArg}`;

            await apiUtil
                .submitRequest(identifierSearchUrl)
                .then(response => {
                    result.success = response.statusCode == 200 ? true : false;
                    result.data = response.data;
                    result.statusCode = response.statusCode;
                })
                .catch(error => {
                    console.log(error);
                });
            resolve(result);
        }
    });
};
