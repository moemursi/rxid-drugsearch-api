/* eslint-disable no-async-promise-executor */
'use strict';

const nlmSearch = require('./services/nlmClient');
const openFDASearch = require('./services/openFDAClient');

const promisesUtil = require('../../common/utils/promisesUtil');
const collectionUtil = require('../../common/utils/collectionUtil');

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

/**
 * Drug Information Search Endpoint
 *
 * @param {*} query searchName - derived label of drug (e.g. Lipitor 10mg Tablet)
 * @returns {Promise} FDA Drug Info
 */
exports.searchFDADrugInfo = query => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: [],
            errors: {}
        };

        const input = getParameterObject(query);
        let validationResults = validateDrugSearchInput(input);
        if (collectionUtil.isEmpty(input.searchName)) {
            resp.errors = validationResults.results;
            resolve({
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Validation error occurred: Parameters missing.'
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } else {
            // TODO: Extract this garbage to a model
            let drugInformation = {
                mechanismOfAction: {},
                warnings: {},
                precautions: {},
                boxedWarning: {},
                patientLabelInformation: {},
                drugUsage: {
                    general: {},
                    pediatric: {},
                    geriatric: {}
                },
                classification: [],
                brandName: {},
                genericName: {}
            };

            let fdaResults = {
                results: []
            };

            let promiseCollection = [];

            promiseCollection.push(
                openFDASearch.searchOpenFdaDrugLabelsPromise(input.searchName)
            );

            promiseCollection.push(
                openFDASearch.searchOpenFdaDrugNDCPromise(input.searchName)
            );

            Promise.all(promiseCollection)
                .then(results => {
                    let fdaLabels = results[0];

                    let fdaNDC = results[1];

                    if (fdaLabels) {
                        drugInformation.mechanismOfAction = fdaLabels.data
                            .results[0].mechanism_of_action
                            ? fdaLabels.data.results[0].mechanism_of_action
                            : 'N/A';

                        drugInformation.precautions = fdaLabels.data.results[0]
                            .precautions
                            ? fdaLabels.data.results[0].precautions
                            : 'N/A';

                        if (fdaLabels.data.results[0].warnings_and_cautions) {
                            drugInformation.warnings =
                                fdaLabels.data.results[0].warnings_and_cautions;
                        } else if (fdaLabels.data.results[0].warnings) {
                            drugInformation.warnings =
                                fdaLabels.data.results[0].warnings;
                        } else {
                            drugInformation.warnings = 'N/A';
                        }

                        drugInformation.boxedWarning = fdaLabels.data.results[0]
                            .boxed_warning
                            ? fdaLabels.data.results[0].boxed_warning
                            : 'N/A';

                        drugInformation.patientLabelInformation = fdaLabels.data
                            .results[0].spl_patient_package_insert
                            ? fdaLabels.data.results[0]
                                  .spl_patient_package_insert
                            : 'N/A';

                        drugInformation.drugUsage.general = fdaLabels.data
                            .results[0].indications_and_usage
                            ? fdaLabels.data.results[0].indications_and_usage
                            : 'N/A';

                        drugInformation.drugUsage.pediatric = fdaLabels.data
                            .results[0].pediatric_use
                            ? fdaLabels.data.results[0].pediatric_use
                            : 'N/A';

                        drugInformation.drugUsage.geriatric = fdaLabels.data
                            .results[0].geriatric_use
                            ? fdaLabels.data.results[0].geriatric_use
                            : 'N/A';

                        drugInformation.drugUsage.disclaimer = fdaLabels.data
                            .meta.disclaimer
                            ? fdaLabels.data.meta.disclaimer
                            : 'N/A';
                    }

                    if (fdaNDC) {
                        drugInformation.classification =
                            fdaNDC.data.results[0].pharm_class;

                        drugInformation.brandName =
                            fdaNDC.data.results[0].brand_name;

                        drugInformation.genericName =
                            fdaNDC.data.results[0].generic_name;
                    }

                    resp.success = true;
                    fdaResults.results.push(drugInformation);
                    resp.results = fdaResults;

                    resolve({
                        statusCode: resp.success == true ? 202 : 400,
                        body: JSON.stringify(
                            resp.success == true ? resp.results : resp.errors
                        ),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                })
                .catch(reason => {
                    resolve({
                        statusCode: 400,
                        body: JSON.stringify({
                            error: reason
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                });
        }
    });
};

/**
 * Checks to see where in the event the client placed the query
 * parameters.
 *
 * @param {*} query original event input
 * @returns {Object} parameter object
 */
function getParameterObject(query) {
    if (query) {
        if (
            !collectionUtil.isEmpty(query.name) ||
            !collectionUtil.isEmpty(query.searchName) ||
            !collectionUtil.isEmpty(query.ndc) ||
            !collectionUtil.isEmpty(query.userLat) ||
            !collectionUtil.isEmpty(query.gcn_seqno)
        ) {
            return query;
        } else if (
            query.headers &&
            (!collectionUtil.isEmpty(query.headers.name) ||
                !collectionUtil.isEmpty(query.headers.ndc) ||
                !collectionUtil.isEmpty(query.headers.userLat) ||
                !collectionUtil.isEmpty(query.headers.gcn_seqno) ||
                !collectionUtil.isEmpty(query.headers.searchName))
        ) {
            return query.headers;
        } else if (
            query.queryStringParameters &&
            (!collectionUtil.isEmpty(query.queryStringParameters.name) ||
                !collectionUtil.isEmpty(query.queryStringParameters.ndc) ||
                !collectionUtil.isEmpty(query.queryStringParameters.userLat) ||
                !collectionUtil.isEmpty(
                    query.queryStringParameters.gcn_seqno
                ) ||
                !collectionUtil.isEmpty(query.queryStringParameters.searchName))
        ) {
            return query.queryStringParameters;
        }
    } else {
        return null;
    }
}

/**
 * Validates Drug Query Arguments
 *
 * @param {*} query input params
 * @returns {boolean} success
 */
function validateDrugSearchInput(query) {
    let validation = {
        error: false,
        results: ''
    };
    if (!collectionUtil.isEmpty(query)) {
        if (
            !(
                !collectionUtil.isEmpty(query.name) ||
                !collectionUtil.isEmpty(query.searchName)
            )
        ) {
            if (!collectionUtil.isEmpty(query.gcnSeqNo)) {
                validation.error = true;
                validation.results =
                    'Query Invalid! A name or searchName is required for Drug Search. Otherwise, provide gcnSeqNo';
            }
        }
    } else {
        validation.results =
            'Query parameters must not be null! Requires at least a name for Drug Search';
        validation.error = true;
    }

    return validation;
}
