/* eslint-disable no-undef */
// const expect = require('chai').expect;

// const openFDAService = require('../../functions/drugSearch/services/openFDAClient');

// describe('OpenFDA Drug Search', function() {
//     it('OpenFDA Drug NDC Search', async () => {
//         let queryParameterString = { name: 'Metformin' };

//         let result = await openFDAService.searchOpenFdaDrugNDCPromise(
//             queryParameterString.name
//         );

//         expect(result.success).to.eq(true);
//         expect(JSON.stringify(result.data)).to.contain('disclaimer');
//     });

//     it('OpenFDA Drug Labels Search', async () => {
//         let queryParameterString = { name: 'Metformin' };

//         let result = await openFDAService.searchOpenFdaDrugLabelsPromise(
//             queryParameterString.name
//         );

//         expect(result.success).to.eq(true);
//         expect(JSON.stringify(result.data)).to.contain('disclaimer');
//     });
// });
