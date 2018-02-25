'use strict'

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

//const {randObjId} = require('../synchronize_service/test/help_methods/common.js');
const {clearBD} = require('../synchronize_service/test/help_methods/dataBase.js');
const {fillDataBase} = require('../synchronize_service/test/help_methods/dataBase.js');
const {permissions} = require('../libs/Common');

const mongoose = require('m_mongoose');
require('m_database');

const User = mongoose.models.User;
describe("User test", () => {

    let newUserObj;
    let groupId1;
    let groupId2;

    beforeEach((done) => {

        fillDataBase()
        .then(result=>{
           groupId1 = result.a;
           groupId2 = result.b;

           newUserObj = {
              name: 'User1',
              password: '12345678',
              email: 'mail@ml.com'
           };

           done();
       })
       .catch(err=>{
           console.log(err);
           done();
       });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Save new User", done=> {
        User.create(newUserObj)
        .then(result=>{
            //console.log('Create User - ', result);
            expect(result.name).equal('User1');
            expect(result.PasswordHash).exist;
            expect(result.Salt).exist;
            done();
        }, err=>{
            done(err);
        });
    });

    it("Check user password", done=> {
        User.create(newUserObj)
        .then(result=>{
            expect(result.checkPassword('12345678')).true;
            done();
        }, err=>{
            done(err);
        });
    });

    /*it("Check user permission", done=> {
        User.create(newUserObj)
        .then(user=>{
            user.groups_ids.push(groupId1);
            return user.save();
        })
        .then(user=>{
            expect(user.setPermission(groupId1, permissions.PERMISSION_VIEW)).true;
            expect(user.setPermission(groupId1, permissions.PERMISSION_EDIT)).true;
            expect(user.setPermission(groupId2, permissions.PERMISSION_VIEW)).false;
            expect(user.setPermission(groupId2, permissions.PERMISSION_EDIT)).false;
            return user.save();
        })
        .then(user=>{
            expect(user.setPermission(groupId1, permissions.PERMISSION_VIEW)).false;
            expect(user.setPermission(groupId1, permissions.PERMISSION_EDIT)).false;
            expect(user.setPermission(groupId1, permissions.PERMISSION_EDIT, false)).true;
            return user.save();
            done();
        })
        .then(user=>{
            expect(user.getPermission(groupId1, permissions.PERMISSION_VIEW)).true;
            expect(user.getPermission(groupId1, permissions.PERMISSION_EDIT)).false;
            done();
        })
        .catch(err=>{
            done(err);
        });
    });*/
});
