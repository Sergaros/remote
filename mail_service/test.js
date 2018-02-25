const request = require('supertest');
const expect = require('chai').expect
const app = require('./server.js');

describe('Mail Service:', function() {

    before((done) => { //service must be configured before using
        request(app)
            .post('/config')
            .send({})
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                done();
            });
    });

    it('Server get', function(done) {
        request(app)
            .get('/')
            .expect(200)
            .then(response => {
                //console.log(response.text);
                expect(response.text).equal('QUBYX mail service.');
                done();
            });

        /*.end(function(err, res) {
              if (err) throw err;
              done();
          });*/
    });

    it('Server post /sent', function(done) {

        let message = {
            from: 'sergiy@qubyx.com',
            to: 'darkbrother@ukr.net',
            subject: 'Message title',
            text: 'Plaintext version of the message',
            html: '<p>HTML version of the message</p>'
        };

        request(app)
            .post('/sent')
            .send(message)
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                let result = JSON.parse(response.text);
                expect(result.envelope.from).equal('sergiy@qubyx.com');
                expect(result.envelope.to[0]).equal('darkbrother@ukr.net');

                done();
            });
    });

});
