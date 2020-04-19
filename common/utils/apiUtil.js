'use strict';

// const axios = require('axios');
const fetch = require('node-fetch');
// const parseString = require('xml2js').parseString;

// exports.submitRequest = async function(url, headers) {
//     try {
//         let result = {
//             statusCode: 500,
//             data: {}
//         };
//         return axios.get(url, headers).then(response => {
//             console.log('---------------------')
//             let resp = response
//             result.statusCode = response.status;
//             result.data = response.data.results[0];
//             return result;
//         });
//     } catch (error) {
//         console.error(error);
//     }
// };

exports.submitRequest = async function(url, headers) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        const params = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin',
            headers: headers
        };
        await fetch(url, params)
            .then(response => {
                result.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                console.log('---------------------');
                result.data = data;
            });

        // .then(response => {
        //     console.log('---------------------')
        //     let resp = response
        //     result.statusCode = response.status;
        //     result.data = response.json();
        // });

        return result;
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
