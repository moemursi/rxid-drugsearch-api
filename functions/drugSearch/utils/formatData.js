/* eslint-disable no-async-promise-executor */
/* eslint-disable no-invalid-regexp */
'use strict';

/**
 * Formats string from OpenFDA by removing first substring set
 * @param {*} unformattedString unformatted string
 * @returns {String} formatted string
 */
module.exports.formatFDAData = unformattedString => {
    let formattedString = unformattedString
        ? removeBulletPoints(getStringWithoutNumberPrefix(unformattedString))
        : 'Not available.';

    return formattedString;
};

/**
 * Removes number prefix in string
 * @param {*} string unformatted string
 * @returns {String} formatted string
 */
function getStringWithoutNumberPrefix(string) {
    let stringSplit = string.split(/(?<=^\S+)\s/);
    return stringSplit.length > 1 ? stringSplit[1] : stringSplit[0];
}

/**
 * Removes odd bullet point from text
 *
 * @param {*} string unformatted string
 * @returns {String} formatted string
 */
function removeBulletPoints(string) {
    let stringFormatted = string.match()
        ? string.replace('\u2022', '')
        : string;
    return stringFormatted;
}
