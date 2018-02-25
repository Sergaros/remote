const chai = require('chai');
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBaseUsers = require('./help_methods/dataBase.js').fillDataBaseUsers;

const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;
const User = mongoose.models.User;

describe("Groups tree", () => {
    let groupIds;

    beforeEach(done => {
        fillDataBaseUsers()
        .then(results=>{
            groupIds = results;
            done();
        })
        .catch(err=>{
            //console.log(err);
            done();
        });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Check count", done=> {
        Group.count()
        .then(res=>{
            expect(res).equal(5);
            done();
        });
    });

    it("Check root group", done=> {
        Group.findOne({_id: groupIds.root})
        .then(group=>{
            expect(group.ancestors.length).equal(2);
            expect(group.ancestors[0].equals(groupIds.a)).true;
            expect(group.ancestors[1].equals(groupIds.b)).true;
            done();
        });
    });
    it("Check b group", done=> {
        Group.count()
        .then(res=>{
            return Group.findOne({_id: groupIds.b});
        })
        .then(group=>{
            expect(group.parent_id.equals(groupIds.root)).true;
            expect(group.ancestors[0].equals(groupIds.c)).true;
            done();
        });
    });
    it("Remove b group", done=> {
        Group.Delete(groupIds.b)
        .then(group=>{
            expect(group.name).equal('B Group');
        })
        .then(()=>{
            return Group.findOne({_id: groupIds.root});
        })
        .then(group=>{
            expect(group.ancestors.length).equal(1);
            expect(group.ancestors[0].equals(groupIds.a)).true;
        })
        .then(()=>{
            return Group.findOne({_id: groupIds.c});
        })
        .then(group=>{
            expect(group===null).true;
        })
        .then(()=>{
            return User.find({});
        })
        .then(users=>{
            let userAdmin = users.find(user=>user.name==='Admin');
            expect(userAdmin.groups_ids.length).equal(1);

            let user1 = users.find(user=>user.name==='User1');
            expect(user1.groups_ids.length).equal(1);
            expect(user1.groups_ids[0].equals(groupIds.a)).true;

            let user2 = users.find(user=>user.name==='User2');
            expect(user2).not.exist;

            done();
        })
        .catch(err=>{
            console.log('Error: ',err);
            done();
        });
    });
    it("Remove root group", done=> {
        Group.Delete(groupIds.root)
        .then(group=>{
            expect(group.name).equal('Root Group');
        })
        .then(()=>{
            return Group.find({});
        })
        .then(groups=>{
            expect(groups.length).equal(0);
        })
        .then(()=>{
            return User.find({});
        })
        .then(users=>{
            expect(users.length).equals(0);
            done();
        })
        .catch(err=>{
            console.log('Error: ',err);
            done();
        });;
    });
    it("Get ancestors Ids", done=> {
        Group.GetAncestorsIds(groupIds.root)
        .then(results=>{
            expect(results.length).equal(4);
            done();
        });
    });

    it("Get parents Ids", done=> {
        Group.GetParentsIds(groupIds.c)
        .then(results=>{
            expect(results.length).equal(2);
            return Group.GetParentsIds(groupIds.a);
        })
        .then(results=>{
            expect(results.length).equal(1);
            return Group.GetParentsIds(groupIds.root);
        })
        .then(results=>{
            expect(results.length).equal(0);
            done();
        });
    });

    it("Replace groups", done=> {
        Group.findOne({_id :groupIds.c})
        .then(group=>{
            expect(group.parent_id.equals(groupIds.b)).true;
            return Group.ReplaceGroup(groupIds.b, groupIds.a);
        })
        .then(results=>{
            return Group.findOne({_id :groupIds.c});
        })
        .then(group=>{
            expect(group.parent_id.equals(groupIds.a)).true;
            return Group.GetAncestorsIds(groupIds.a);
        })
        .then(ancestors=>{
            expect(ancestors.length).equal(2);
            return Group.GetAncestorsIds(groupIds.b);
        })
        .then(ancestors=>{
            expect(ancestors.length).equal(0);
            done();
        })
        .catch(err=>{
            throw err;
        });
    });
});
