/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const expect = require('chai').expect;
const sinon = require('sinon');

let drugSearchCtrl = require('../../functions/drugSearch/drugSearchCtrl');
let nlmSearch = require('../../functions/drugSearch/services/nlmClient');

describe('drugSearchCtrl getDrugIdentifiers', function drugSearchCtrlTest() {
    // NLM Drug Search Service Spy
    let nlmDrugImageSearchSpy = sinon.spy(nlmSearch, 'nlmDrugImageSearch');

    context('input missing - ', function() {
        it('should return a failure', async function() {
            let result;
            await drugSearchCtrl
                .getDrugIdentifiers(null)
                .then(response => {
                    result = response;
                    console.log(result);
                    // Assert
                    expect(result.statusCode).to.eq(400);
                })
                .catch(reason => (result = reason));
        });
    });

    context('input ok - ', function() {
        it('should return a successful search by name', async function() {
            let event = {
                queryStringParameters: {
                    drugName: 'Albuterol'
                }
            };
            await drugSearchCtrl
                .getDrugIdentifiers(event)
                .then(response => {
                    let result = response;
                    // Assert
                    expect(result.statusCode).to.eq(200);
                    expect(result.body.data).to.not.eq(null);

                    nlmDrugImageSearchSpy.restore();
                    sinon.assert.calledWith(
                        nlmDrugImageSearchSpy,
                        event.queryStringParameters.drugName
                    );
                })
                .catch(reason => (result = reason));
        });

        it('should return a successful search by identifiers', async function() {
            let event = {
                queryStringParameters: {
                    drugColor: 'blue',
                    drugImprint: '644',
                    drugShape: 'round'
                }
            };
            await drugSearchCtrl
                .getDrugIdentifiers(event)
                .then(response => {
                    let result = response;
                    // Assert
                    expect(result.statusCode).to.eq(200);
                    expect(result.body.data).to.not.eq(null);

                    nlmDrugImageSearchSpy.restore();
                    sinon.assert.calledWith(
                        nlmDrugImageSearchSpy,
                        event.queryStringParameters.drugName
                    );
                })
                .catch(reason => (result = reason));
        });
    });
});
