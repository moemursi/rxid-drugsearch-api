'use strict';

const axios = require('axios');
// const parseString = require('xml2js').parseString;

exports.submitRequest = async function(url, headers) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        return axios.get(url, headers).then(response => {
            result.statusCode = response.status;
            result.data = response.data;
            return result;
        });
    } catch (error) {
        console.error(error);
    }
};

// exports.submitXmlRequest = async function(url) {
//     try {
//         let result = {
//             statusCode: 500,
//             data: {}
//         };
//         return axios.get(url).then(response => {
//             result.statusCode = response.status;
//             let parsedBody = {};
//             parseString(response.data, function(err, result) {
//                 if (err) {
//                     parsedBody = err;
//                 } else {
//                     parsedBody = result;
//                 }
//             });
//             result.data = parsedBody;
//             return result;
//         });
//     } catch (error) {
//         console.error(error);
//     }
// };
