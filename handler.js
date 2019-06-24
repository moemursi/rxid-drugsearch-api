'use strict';

const drugSearch = require('./functions/drugSearch/drugSearchCtrl');

module.exports.getDrugIdentifiers = async (event) => {
  return drugSearch.getDrugIdentifiers(event);
};
