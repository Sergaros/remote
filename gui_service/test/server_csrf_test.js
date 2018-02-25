/*const config = require('config');
const port = config.get('port');
const app = require('../server.js');
const chai = require('chai');
const expect = chai.expect;
var request = require('supertest').agent(app.listen(port));

const clearBD = require('../../synchronize_service/test/help_methods/dataBase.js').clearBD;
const fillDataBase = require('../../synchronize_service/test/help_methods/dataBase.js').fillDataBase;
const mongoose = require('m_mongoose');
require('m_database');

const User = mongoose.models.User;

expect(process.env.NODE_ENV).to.equal('test');

const host = `http://127.0.0.1:${port}`;

var token;
var cookie;

describe.only('csrf', function() {
  describe('GET /token', function() {
    it('should get token', function(done) {
      request
      .get('/token')
      .expect(200)
      .end(function(err, res) {
        token = res.text;
        cookie = res.headers['set-cookie'].join(';');
        //console.log('token - ', token);
        expect(token).not.empty;
        done(err);
      });
    });
  });

  describe('POST /post', function() {

    before(done=>{
        request
        .get('/oncsrf')
        .end(function(err, res) {
          done(err);
        });
    });

    beforeEach(done=>{
        fillDataBase()
        .then(result=>{//create user
            dbData  = result;
            return User.create({
                Name: 'User1',
                Password: '12345678',
                Email: 'mail@ml.com',
                groups_ids: [dbData.root]
            })
        }).then(result=>{
            done()
        })
        .catch(err=>{
            console.log('Error: ',err);
            done();
        });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it('should 403 without token', function(done) {
        request
        .post(`${host}/login`)
        .set('Cookie', cookie)
        .set('x-csrf-token', token)
        .send({Name: 'User1', Password: '12345678'})
        .expect(200, ()=>{
            console.log('!!!!!!!!!!!!!!!!!!!');
            request
            .post('/token')
            .send({foo: 'bar'})
            .expect(403, done);
        });
    });
});
});*/

/*const request = require("request").defaults({
  encoding: null
});

const fs = require('fs');
const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;
const config = require('config');
const port = config.get('port');
const http = require('http');

const app = require('../server.js');

const clearBD = require('../../synchronize_service/test/help_methods/dataBase.js').clearBD;
const fillDataBase = require('../../synchronize_service/test/help_methods/dataBase.js').fillDataBase;
const mongoose = require('m_mongoose');
require('m_database');

const User = mongoose.models.User;

expect(process.env.NODE_ENV).to.equal('test');

const host = `http://127.0.0.1:${port}`;

describe.only("csrf protect", () => {
    let j;
    let token;
    let cookies;


    before(done => {
        server = http.createServer(app.callback());
        server.listen(port, '127.0.0.1', done);
    });

    after(done => {
        server.close(done);
    });

    beforeEach(done=>{
        fillDataBase()
        .then(result=>{//create user
            dbData  = result;
            return User.create({
                Name: 'User1',
                Password: '12345678',
                Email: 'mail@ml.com',
                groups_ids: [dbData.root]
            })
        }).then(result=>{//set csrs key for test
            request.get({url:`${host}/oncsrf`, jar: j}, function(error, response, body){
                if (error) return done(error);

                j = request.jar(); // login
                request.post({url:`${host}/login`, form: {Name: "User1", Password: "12345678"}, jar: j}, function(error, response, body){
                    if (error) return done(error);

                    request.get({url: `${host}/isloggedin`, jar: j}, (error, response, body) => {
                        if (error) return done(error);
                        //console.log('isloggedin - ', j);
                        done();
                    });
                });
            });
        })
        .catch(err=>{
            console.log('Error: ',err);
            done();
        });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Get token", done => {
        j = request.jar();
        request.get({url:`${host}/token`, jar: j}, function(error, response, body){
            if (error) return done(error);

            //console.log('body - ',body.toString('utf-8'));
            //console.log('cookies - ', j);

            let token = body.toString('utf-8');
            let cookies = j;

            expect(token).not.empty;
            done();
        });
    });

    it('should 403 without token', function(done) {

        request.post({url:`${host}/token`, form:{foo: 'bar'}, jar: j}, function(error, response, body){
            if (error) return done(error);
            console.log('j: ',j);
            //console.log('body post - ',body.toString('utf-8'));
            expect(response.statusCode).to.be.equal(403);
            done();
        });
   });

});*/
