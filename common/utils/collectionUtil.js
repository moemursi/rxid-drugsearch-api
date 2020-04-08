//@flow
'use strict';

exports.static_values = {
    PAGINATE_LIMIT: 50,
    RC_ALREADY_EXISTS: 'ALREADY_EXISTS'
};

/**
 * function: paginate_results
 * desc: Paginate results
 * @param {*} results - colleciton to sort
 *  - optional properties of the collection is the {sortField} if present it can be used to sort the results.
 * @param {*} sortField - (Optional) Field to perform sort on
 * @param {*} pageNumber - (Optional) If specified the pagination will use this return results for this page.
 *
 * @returns {*} results{} - results object including pagination information.
 */
exports.paginate_results = (results, sortField, pageNumber) => {
    let resultsCount = this.isEmpty(results) === true ? 0 : results.length;
    if (resultsCount > 0) {
        // - sort members decending if sorter property defined
        if (this.isEmpty(sortField) === false) {
            results.sort((m1, m2) => {
                if (m1[sortField] < m2[sortField]) {
                    return 1;
                }
                if (m1[sortField] > m2[sortField]) {
                    return -1;
                }
                return 0;
            });
        }

        // let stringifiedResults = {};
        // stringifiedResults = JSON.parse(JSON.stringify(results));

        let page = this.isEmpty(pageNumber) === true ? 0 : parseInt(pageNumber);
        let pages = Math.ceil(
            parseInt(resultsCount) / process.env.PAGINATE_LIMIT
        );
        if (page > pages) {
            page = pages;
        }
        let startIndex =
            page * process.env.PAGINATE_LIMIT === 0
                ? 0
                : page * process.env.PAGINATE_LIMIT;
        let endIndex = startIndex + process.env.PAGINATE_LIMIT;
        let paginatedResults = {};
        paginatedResults['results'] = [];
        paginatedResults['results'] = results.slice(startIndex, endIndex);
        paginatedResults['limit'] = process.env.PAGINATE_LIMIT;
        paginatedResults['page'] = page;
        paginatedResults['pages'] = pages;
        paginatedResults['total'] = resultsCount;
        return paginatedResults;
    } else {
        return {};
    }
};

exports.isEmpty = function(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Checks for boolean values
    if (obj === false || obj === true) return false;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};
