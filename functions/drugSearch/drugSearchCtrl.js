'use strict';

const nlmSearch = require('./services/nlmSearch');

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

        if (query && query.queryStringParameters) {
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