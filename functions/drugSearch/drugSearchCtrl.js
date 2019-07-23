/* eslint-disable no-async-promise-executor */
'use strict';

const nlmSearch = require('./services/nlmSearch');

const promisesUtil = require('../../common/utils/promisesUtil');

/**
 * Drug Identifier Search Controller
 *
 * @param {*} query Required Query Input: drugName
 * @returns {Promise} drug identifiers
 */
module.exports.getDrugIdentifiers = query => {
    return new Promise(async resolve => {
        let resp = {
            results: {
                name: '',
                identifier: {}
            },
            errors: [],
            statusCode: 400
        };

        if (query && query.queryStringParameters) {
            let drugName = query.queryStringParameters.drugName;
            if (!drugName) {
                resolve(
                    promisesUtil.formatPromisePayload(400, {
                        error: 'Drug name parameter is empty!!!'
                    })
                );
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

                resolve(
                    promisesUtil.formatPromisePayload(
                        nlmRxImageSuccess || nlmDrugDatabaseSuccess ? 200 : 400,
                        nlmRxImageSuccess || nlmDrugDatabaseSuccess
                            ? resp.results
                            : resp.errors
                    )
                );
            }
        } else {
            resolve(
                promisesUtil.formatPromisePayload(400, {
                    error: 'Query is empty!'
                })
            );
        }
    });
};
