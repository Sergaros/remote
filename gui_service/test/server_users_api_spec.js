const request = require("request").defaults({
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

describe("Server Users Api", () => {
    let server;
    let user1;
    let user2;
    let user3;
    let user4;
    let j;
    let dbData;


    before(done => {
        server = http.createServer(app.callback());
        server.listen(port, '127.0.0.1', done);
    });

    after(done => {
        server.close(done);
    });

    beforeEach(done=>{
        fillDataBase()
        .then(result=>{
            dbData  = result;
            return User.create({
                name: 'User1',
                password: '12345678',
                email: 'mail@ml.com',
                groups_ids: [dbData.root]
            })
            .then(result=>{
                user1 = result;
                return User.create({
                    name: 'User2',
                    password: '12345678',
                    email: 'mail@ml.com',
                    groups_ids: [dbData.a, dbData.b]
                });
            })
            .then(result=>{
                user2 = result;
                return User.create({
                    name: 'User3',
                    password: '12345678',
                    email: 'mail@ml.com',
                    groups_ids: [dbData.b]
                });
            })
            .then(result=>{
                user3 = result;
                return User.create({
                    name: 'User4',
                    password: '12345678',
                    email: 'mail@ml.com',
                    groups_ids: [dbData.c]
                });
            });
        })
        .then(result=>{
            user4 = result;
            done();
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

    /*it("Connect to first page", done => {
        request.get(host, (error, response, body) => {
            if (error) return done(error);
            expect(response.statusCode).equal(200);
            expect(body.toString('utf-8')).equal('QUBYX synchronize service.');
            done();
        });
    });*/

    it("Connect to not exist page", done => {
        request.get(`${host}/some_not_exist_page`, (error, response, body) => {
            if (error) return done(error);
            expect(response.statusCode).to.be.equal(404);
            done();
        });
    });

    it("loggin test", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);

            request.get({url: `${host}/isloggedin`, jar: j}, (error, response, body) => {
                if (error) return done(error);

                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.result).true;
                done();
            });
        });
    });

    it("Get all users for use with root group", done => {
        /*request.post({url: `${host}/login`,
                      //data: {name: 'User1', password: '12345678'},
                      'content-type': 'application/json'},
                      (error, response, body) => {*/
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                //expect(response.statusCode).to.be.equal(404);
                //console.log('response - ', body.toString('utf-8'));
                //console.log('cookies - ', j);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(3);
                done();
            });
        });
    });

    it("Get all users for use with a,b group", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User2", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);

            request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(2);
                done();
            });
        });
    });

    it("Get all users for use with c group", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User4", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);

            request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(0);
                done();
            });
        });
    });

    it("Delete user", done => {
        j = request.jar();
        let users;
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(3);
                return Promise.resolve(responceObj)
                .then(users=>{
                        request.delete({url: `${host}/api/users/${users[0]._id}`, jar: j}, (error, response, body) => {
                            let responceObj = JSON.parse(body.toString('utf-8'));
                            expect(responceObj.result).true;
                                request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                                    let responceObj = JSON.parse(body.toString('utf-8'));
                                    expect(responceObj.length).equal(2);
                                    done();
                            });
                        });
                })
            });
        });
    });

    it("Update user", done => {
        j = request.jar();
        let users;
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            request.get({url: `${host}/api/users`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(3);
                return Promise.resolve(responceObj)
                .then(users=>{
                        let userId = users[0]._id;
                        request.patch({url: `${host}/api/users/${users[0]._id}`,form: {name: "NewName", email: "new@email.com"}, jar: j}, (error, response, body) => {
                            let responceObj = JSON.parse(body.toString('utf-8'));
                            expect(responceObj.result).true;
                                request.get({url: `${host}/api/users/${users[0]._id}`, jar: j}, (error, response, body) => {
                                    let responceObj = JSON.parse(body.toString('utf-8'));
                                    expect(responceObj.name).equal('NewName');
                                    expect(responceObj.email).equal('new@email.com');
                                    done();
                            });
                        });
                })
            });
        });
    });
});
