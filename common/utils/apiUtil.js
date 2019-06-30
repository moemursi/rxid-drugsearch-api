'use strict';

const axios = require('axios');

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
