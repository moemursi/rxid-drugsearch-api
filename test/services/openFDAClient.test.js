// /* eslint-disable no-undef */
// const expect = require('chai').expect;

// const openFDAService = require('../../functions/drugSearch/services/openFDAClient');

// // const expect = require('chai').expect;
// // const sinon = require('sinon');

// // describe('drugSearchCtrl getDrugIdentifiers', function drugSearchCtrlTest() {
// //     // NLM Drug Search Service Spy
// //     let nlmDrugImageSearchSpy = sinon.spy(nlmSearch, 'nlmDrugImageSearch');

// //     context('input missing - ', function() {
// //         it('should return a failure', async function() {
// //             let result;
// //             await drugSearchCtrl
// //                 .getDrugIdentifiers(null)
// //                 .then(response => (result = response))
// //                 .catch(reason => (result = reason));

// //             // Assert
// //             expect(result.statusCode).to.eq(400);
// //         });
// //     });

// //     context('input ok - ', function() {
// //         let event = {
// //             queryStringParameters: {
// //                 drugName: 'Albuterol'
// //             }
// //         };

// //         it('should return a successful search', async function() {
// //             let result;
// //             await drugSearchCtrl
// //                 .getDrugIdentifiers(event)
// //                 .then(response => (result = response))
// //                 .catch(reason => (result = reason));

// //             // Assert
// //             expect(result.statusCode).to.eq(200);
// //             expect(result.body.data).to.not.eq(null);

// //             nlmDrugImageSearchSpy.restore();
// //             sinon.assert.calledWith(
// //                 nlmDrugImageSearchSpy,
// //                 event.queryStringParameters.drugName
// //             );
// //         });
// //     });
// // });

// describe('OpenFDA Drug Search', function() {
//     context('input - Metformin ', function() {
//         it('OpenFDA Drug NDC Search', async function() {
//             let result;

//             await openFDAService
//                 .searchOpenFdaDrugLabelsPromise('Tylenol')
//                 .then(response => (result = response))
//                 .catch(reason => (result = reason));

//             // Assert
//             expect(result.success).to.eq(true);
//         });
//     });

//     // it('OpenFDA Drug NDC Search', async function() {
//     //     // let queryParameterString = { name: 'Metformin' };

//     //     let result;

//     //     await openFDAService
//     //         .searchOpenFdaDrugLabelsPromise('Tylenol')
//     //         .then(response => (result = response))
//     //         .catch(reason => (result = reason));

//     //     expect(result.success).to.eq(true);
//     //     expect(JSON.stringify(result.data)).to.contain('disclaimer');
//     // });

//     // it('OpenFDA Drug Labels Search', async () => {
//     //     let queryParameterString = { name: 'Metformin' };

//     //     let result = await openFDAService.searchOpenFdaDrugLabelsPromise(
//     //         queryParameterString.name
//     //     );

//     //     expect(result.success).to.eq(true);
//     //     expect(JSON.stringify(result.data)).to.contain('disclaimer');
//     // });
// });
