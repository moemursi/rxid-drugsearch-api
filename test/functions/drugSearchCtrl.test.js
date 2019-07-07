/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const expect = require('chai').expect;
const sinon = require('sinon');

let drugSearchCtrl = require('../../functions/drugSearch/drugSearchCtrl');
let nlmSearch = require('../../functions/drugSearch/services/nlmSearch');

describe('drugSearchCtrl getDrugIdentifiers', function drugSearchCtrlTest() {
    // NLM Drug Search Service Spy
    let nlmDrugImageSearchSpy = sinon.spy(nlmSearch, 'nlmDrugImageSearch');

    context('input missing - ', function() {
        it('search failure', async function() {
            let result;
            await drugSearchCtrl
                .getDrugIdentifiers(null)
                .then(response => (result = response))
                .catch(reason => (result = reason));

            // Assert
            expect(result.statusCode).to.eq(400);
        });
    });

    context('input ok - ', function() {
        let event = {
            queryStringParameters: {
                drugName: 'Albuterol'
            }
        };

        it('search success', async function() {
            let result;
            await drugSearchCtrl
                .getDrugIdentifiers(event)
                .then(response => (result = response))
                .catch(reason => (result = reason));

            // Assert
            expect(result.statusCode).to.eq(200);
            expect(result.body.data).to.not.eq(null);

            nlmDrugImageSearchSpy.restore();
            sinon.assert.calledWith(
                nlmDrugImageSearchSpy,
                event.queryStringParameters.drugName
            );
        });
    });
});
