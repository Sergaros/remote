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
const Group = mongoose.models.Group;

expect(process.env.NODE_ENV).to.equal('test');

const host = `http://127.0.0.1:${port}`;

describe("Server Groups Api", () => {
    let server;

    let user1;
    let user2;

    let group1;
    let group2;

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
            });
        })
        .then(result=>{
            user1 = result;
            return Group.Create({
                name: 'TestGroup1',
                description: 'Test group description',
                parent_id: dbData.root
            });
        })
        .then(result=>{
            group1 = result;
            return User.create({
                name: 'User2',
                password: '12345678',
                email: 'mail@ml.com',
                groups_ids: [result._id]
            });
        })
        .then(result=>{
            user2 = result;
        })
        .then(()=>{
            return Group.Create({
                name: 'TestGroup2',
                description: 'Test group description',
                parent_id: group1._id
            });
        })
        .then(result=>{
            group2 = result;
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

    it("Get all group from Admin user", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.get({url: `${host}/api/groups`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(7);
                done();
            });
        });
    });

    it("Get all group from Costum user", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User2", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.get({url: `${host}/api/groups`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.length).equal(2);
                done();
            });
        });
    });

    it("Get group from Admin user", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.get({url: `${host}/api/groups/${group1._id}`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.name).equal('TestGroup1');
                done();
            });
        });
    });

    it("Get group dependencies", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.get({url: `${host}/api/groups/dependencies/${group1._id}`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.users.length).equal(1);
                expect(responceObj.groups.length).equal(1);
                done();
            });
        });
    });

    it("Parent swap", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            request.post({url: `${host}/api/groups/parentswap`,
                form: {oldid: group1._id.toString(), newid: dbData.a.toString()}, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                expect(responceObj.result).true;
                Group.GetAncestorsIds(group1._id)
                .then(ids=>{
                    expect(ids.length).equal(0);
                    return Group.GetAncestorsIds(dbData.a);
                })
                .then(ids=>{
                    expect(ids.length).equal(2);
                    done();
                });
            });
        });
    });

    it("Delete group", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.delete({url: `${host}/api/groups/${group1._id}`, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                Group.findOne({_id: group1._id})
                .then(group=>{
                    expect(group).null;
                })
                .then(()=>{
                    Group.findOne({_id: group2._id})
                    .then(group=>{
                        expect(group).null;
                    });
                })
                .then(()=>{
                    User.findOne({_id: user2._id})
                    .then(user=>{
                        expect(user).null;
                        done();
                    })
                });
            });
        });
    });

    it("Update group", done => {
        j = request.jar();
        request.post({url:`${host}/login`, form: {name: "User1", password: "12345678"}, jar: j}, function(error, response, body){
            if (error) return done(error);
            //console.log('loggin - ', body.toString('utf-8'));

            request.patch({url: `${host}/api/groups/${group1._id}`,form: {name: 'Updated Name', description: 'Updated Description'}, jar: j}, (error, response, body) => {
                if (error) return done(error);
                let responceObj = JSON.parse(body.toString('utf-8'));
                Group.findOne({_id: group1._id})
                .then(group=>{
                    expect(group.name).equal('Updated Name');
                    expect(group.description).equal('Updated Description');
                    done();
                })
                .catch(err=>{throw err});
            });
        });
    });

    /*it("Get all users for use with a,b group", done => {
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
    });*/
});
