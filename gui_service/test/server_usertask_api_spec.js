const agent = require('supertest-koa-agent');
const app = require('../server.js');

const clearBD = require('../../synchronize_service/test/help_methods/dataBase.js').clearBD;
const fillDataBase = require('../../synchronize_service/test/help_methods/dataBase.js').fillDataBase;
const mongoose = require('m_mongoose');
require('m_database');

const User = mongoose.models.User;
const Group = mongoose.models.Group;
const assert = require('assert');

describe('user task api', ()=>{
  let dbData;
  let user;

  beforeEach(done=>{
      fillDataBase()
      .then(result=>{
          dbData  = result;
          return User.create({
              name: 'testUser',
              password: '123456',
              email: 'mail@ml.com',
              groups_ids: [dbData.root]
          });
      })
      .then(result=>{
          user = result;
          return Group.Create({
              name: 'TestGroup',
              description: 'Test group description',
              parent_id: dbData.root
          });
      })
      .then(()=>{
          done();
      })
  });

  afterEach(done => {
      clearBD()
      .then(results=>{
          done();
      });
  });

  it('not found test', done=>{
    agent(app)
    .get(`/somenotexistpage`)
    .end((err,responce)=>{
      assert(err === null);
      assert(responce.error.status === 404);
      done();
    })
  });

  it('login test', done=>{

    agent(app)
    .post(`/login`)
    .field('name', 'testUser')
    .field('password', '123456')
    .end((err,responce)=>{
        assert(err === null);
        assert(responce.status === 302);
      done();
    })
  });
});
