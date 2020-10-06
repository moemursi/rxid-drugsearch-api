/* eslint-disable no-async-promise-executor */
'use strict';

const nlmSearch = require('./services/nlmClient');
const openFDASearch = require('./services/openFDAClient');

const promisesUtil = require('../../common/utils/promisesUtil');
const formatDataUtil = require('../drugSearch/utils/formatData');

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

            let nlmRxImageSuccess = false;
            let nlmDrugDatabaseSuccess = false;

            // Call the NLM Drug Image Search Service
            await nlmSearch
                .nlmDrugImageSearch({
                    drugName: query.queryStringParameters.drugName,
                    drugStrength: query.queryStringParameters.drugStrength,
                    drugColor: query.queryStringParameters.drugColor,
                    drugShape: query.queryStringParameters.drugShape,
                    drugImprint: query.queryStringParameters.drugImprint
                })
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
module.exports.getDrugInfo = query => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: [],
            errors: {}
        };

        if (query && query.queryStringParameters) {
            const input = query.queryStringParameters.searchName;

            // TODO: Extract this garbage to a model
            let drugInformation = {
                mechanismOfAction: '',
                warnings: {},
                precautions: {},
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
                openFDASearch.searchOpenFdaDrugLabelsPromise(input)
            );

            promiseCollection.push(
                openFDASearch.searchOpenFdaDrugNDCPromise(input)
            );

            Promise.all(promiseCollection)
                .then(results => {
                    let fdaLabels = results[0];

                    let fdaNDC = results[1];

                    if (fdaLabels) {
                        let rxData = fdaLabels.data;
                        console.log(rxData);

                        drugInformation.mechanismOfAction = fdaLabels.data
                            .results[0].mechanism_of_action
                            ? formatDataUtil.formatFDAData(
                                  fdaLabels.data.results[0]
                                      .mechanism_of_action[0]
                              )
                            : 'Mechanisms of action are not available.';

                        drugInformation.precautions = fdaLabels.data.results[0]
                            .precautions
                            ? formatDataUtil.formatFDAData(
                                  fdaLabels.data.results[0].precautions[0]
                              )
                            : 'Precautions are not available.';

                        if (fdaLabels.data.results[0].boxed_warning) {
                            console.log(
                                fdaLabels.data.results[0].boxed_warning
                            );
                            let format = formatDataUtil.formatFDAData(
                                fdaLabels.data.results[0].boxed_warning[0]
                            );
                            drugInformation.warnings = format.match('WARNING: ')
                                ? format.split('WARNING: ')[1]
                                : format.match('WARNING ')
                                ? format.split('WARNING ')[1]
                                : format;
                        } else if (
                            fdaLabels.data.results[0].warnings_and_cautions
                        ) {
                            drugInformation.warnings = formatDataUtil
                                .formatFDAData(
                                    fdaLabels.data.results[0]
                                        .warnings_and_cautions[0]
                                )
                                .replace('WARNINGS AND PRECAUTIONS ', '');
                        } else if (fdaLabels.data.results[0].warnings) {
                            drugInformation.warnings = formatDataUtil.formatFDAData(
                                fdaLabels.data.results[0].warnings[0]
                            );
                        } else {
                            drugInformation.warnings =
                                'Warnings are not available.';
                        }

                        drugInformation.patientLabelInformation = fdaLabels.data
                            .results[0].spl_patient_package_insert
                            ? formatDataUtil.formatFDAData(
                                  fdaLabels.data.results[0]
                                      .spl_patient_package_insert[0]
                              )
                            : 'Patient label information is not available.';

                        drugInformation.drugUsage.general = fdaLabels.data
                            .results[0].indications_and_usage
                            ? formatDataUtil
                                  .formatFDAData(
                                      fdaLabels.data.results[0]
                                          .indications_and_usage[0]
                                  )
                                  .replace('INDICATIONS AND USAGE ', '')
                                  .replace('AND USAGE ', '')
                                  .replace('INDICATIONS & USAGE ', '')
                                  .replace('& USAGE ', '')
                            : 'General drug usage data is not available.';

                        drugInformation.drugUsage.pediatric = fdaLabels.data
                            .results[0].pediatric_use
                            ? formatDataUtil.formatFDAData(
                                  fdaLabels.data.results[0].pediatric_use[0]
                              )
                            : 'Pediatric drug usage data is not available.';

                        drugInformation.drugUsage.geriatric = fdaLabels.data
                            .results[0].geriatric_use
                            ? formatDataUtil.formatFDAData(
                                  fdaLabels.data.results[0].geriatric_use[0]
                              )
                            : 'Geriatric drug usage data is not available.';

                        drugInformation.disclaimer = fdaLabels.data.meta
                            .disclaimer
                            ? fdaLabels.data.meta.disclaimer
                            : 'OpenFDA Disclaimer is not available.';

                        drugInformation.description = fdaLabels.data.results[0]
                            .description
                            ? formatDataUtil
                                  .formatFDAData(
                                      fdaLabels.data.results[0].description[0]
                                  )
                                  .replace('DESCRIPTION ', '')
                            : 'Drug description is not available.';
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

                    let statusCode = resp.success == true ? 202 : 400;
                    let body = resp.success ? resp.results : resp.errors;

                    resolve(
                        promisesUtil.formatPromisePayload(statusCode, {
                            body
                        })
                    );
                })
                .catch(reason => {
                    resolve(
                        promisesUtil.formatPromisePayload(400, {
                            error: reason
                        })
                    );
                });
        } else {
            resolve(
                promisesUtil.formatPromisePayload(400, {
                    error:
                        'Validation error occurred: Search parameter missing.'
                })
            );
        }
    });
};

/**
 * Drug Identifier and Label Search Endpoint
 *
 * @param {*} query drugName
 * @returns {Promise} Drug label and identifiers
 */
module.exports.getAllDrugInfo = query => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };

        if (query && query.queryStringParameters) {
            const input = query.queryStringParameters.drugName;

            let drugResults = {
                searchTerm: input,
                identifiers: {},
                labelData: {}
            };

            let promiseCollection = [];

            promiseCollection.push(
                this.getDrugIdentifiers({
                    queryStringParameters: { drugName: input }
                })
            );

            promiseCollection.push(
                this.getDrugInfo({
                    queryStringParameters: { searchName: input }
                })
            );

            Promise.all(promiseCollection)
                .then(results => {
                    let identifiers = results[0];

                    let labelInfo = results[1];

                    if (identifiers) {
                        drugResults.identifiers = JSON.parse(
                            identifiers.body
                        ).identifier;
                    }

                    if (labelInfo) {
                        drugResults.labelData = JSON.parse(
                            labelInfo.body
                        ).body.results[0];
                    }

                    resp.success = true;
                    resp.results = drugResults;

                    let statusCode = resp.success == true ? 202 : 400;
                    let body = resp.success ? resp.results : resp.errors;

                    resolve(
                        promisesUtil.formatPromisePayload(statusCode, {
                            body
                        })
                    );
                })
                .catch(reason => {
                    resolve(
                        promisesUtil.formatPromisePayload(400, {
                            error: reason
                        })
                    );
                });
        } else {
            resolve(
                promisesUtil.formatPromisePayload(400, {
                    error: 'Validation error occurred: Drug name missing.'
                })
            );
        }
    });
};
