const request = require("request").defaults({
  encoding: null
});

const fs = require('fs');
const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;
const config = require('config');
const port = config.get('port');
const server = require('../server.js');

expect(process.env.NODE_ENV).to.equal('test');

const host = `http://127.0.0.1:${port}`;

describe("Server", () => {
    before(done => {
        server.listen(port, '127.0.0.1', done);
    });

    after(done => {
        server.close(done);
    });

    it("Connect to first page", done => {
        request.get(host, (error, response, body) => {
            if (error) return done(error);
            expect(response.statusCode).equal(200);
            expect(body.toString('utf-8')).equal('QUBYX synchronize service.');
            done();
        });
    });

    it("Connect to not exist page", done => {
        request.get(`${host}/some_not_exist_page`, (error, response, body) => {
            if (error) return done(error);
            expect(response.statusCode).to.be.equal(404);
            done();
        });
    });

    /*it("Connect to synchronize page page", done => {
        request.post({url: `${host}/synchronize2.php`,
                      data: fs.createReadStream(__dirname + '/synchronize.json'),
                      'content-type': 'application/json'},
                      (error, response, body) => {
            if (error) return done(error);

            console.log('Upload successful!  Server responded with:', body);
            done();
        });
    });*/
});
