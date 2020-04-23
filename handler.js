'use strict';

const drugSearch = require('./functions/drugSearch/drugSearchCtrl');

module.exports.getDrugIdentifiers = async event => {
    return drugSearch.getDrugIdentifiers(event);
};

module.exports.getDrugInfo = async event => {
    return drugSearch.getDrugInfo(event);
};

module.exports.getAllDrugInfo = async event => {
    return drugSearch.getAllDrugInfo(event);
};
