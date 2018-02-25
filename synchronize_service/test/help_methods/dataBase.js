require('m_database');
const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;
const User = mongoose.models.User;
const Workstation = mongoose.models.Workstation;
const toMD5 = require('./common.js').toMD5;

const clearBD = ()=>{
    let models = [];

    for(model in mongoose.models){
        models.push(model);
    }

    return Promise.all(models.map(model=>{
        if(model === 'Log')
            return true;
        else
            return  mongoose.models[model].remove({});
    }));

    //var db = mongoose.connection.db;
    //return db.dropDatabase();
};

/*
    Admin - root
    User1 - a-d, c
    User2 - b
*/

const CreateUsersStub = (data)=>{
    data.users = {};
    return User.create({
        name: 'Admin',
        email: 'adm@ukr.net',
        password: '123456',
        groups_ids: [data.root]
    })
    .then(user=>{
        data.users.admin = user;
        return User.create({
            name: 'User1',
            email: 'usr1@ukr.net',
            password: '123456',
            groups_ids: [data.a, data.c]
        })
    })
    .then(user=>{
        data.users.user1 = user;
        return User.create({
            name: 'User2',
            email: 'usr2@ukr.net',
            password: '123456',
            groups_ids: [data.b]
        })
    })
    .then(user=>{
        data.users.user2 = user;
        return data;
    })
    .catch(err=>{
        throw err;
    })
}

/* groups tree
root
\   \
 a   b
 \   \
  d   c
*/

const CreateGroupsStub = ()=>{
    let groupIds = {};
    groupIds.synchInfo = {};

    return Group.Create({
        name: 'Root Group',
        sync_login: 'loginRoot',
        sync_password: toMD5('password_root'),
        description: 'Simple test Group'
    })
    .then(rootGroup=>{
        groupIds.synchInfo.root = {};
        groupIds.synchInfo.root.login = rootGroup.sync_login;
        groupIds.synchInfo.root.password = rootGroup.sync_password;

        groupIds.root = rootGroup._id;

        return Group.Create({
            name: 'A Group',
            sync_login: 'loginA',
            sync_password: toMD5('password_a'),
            description: 'Simple test Group',
            parent_id: groupIds.root
        });
    })
    .then(aGroup=>{
        groupIds.synchInfo.a = {};
        groupIds.synchInfo.a.login = aGroup.sync_login;
        groupIds.synchInfo.a.password = aGroup.sync_password;

        groupIds.a = aGroup._id;

        return Group.Create({
            name: 'B Group',
            sync_login: 'loginB',
            sync_password: toMD5('password_b'),
            description: 'Simple test Group',
            parent_id: groupIds.root
        });
    })
    .then(bGroup=>{
        groupIds.synchInfo.b = {};
        groupIds.synchInfo.b.login = bGroup.sync_login;
        groupIds.synchInfo.b.password = bGroup.sync_password;

        groupIds.b = bGroup._id;

        return Group.Create({
            name: 'C Group',
            sync_login: 'loginC',
            sync_password: toMD5('password_c'),
            description: 'Simple test Group',
            parent_id: groupIds.b
        });
    })
    .then(cGroup=>{
        groupIds.synchInfo.c = {};
        groupIds.synchInfo.c.login = cGroup.sync_login;
        groupIds.synchInfo.c.password = cGroup.sync_password;

        groupIds.c = cGroup._id;

        return Group.Create({
            name: 'D Group',
            sync_login: 'loginD',
            sync_password: toMD5('password_d'),
            description: 'Simple test Group',
            parent_id: groupIds.a
        });
    })
    .then(dGroup=>{
        groupIds.synchInfo.d = {};
        groupIds.synchInfo.d.login = dGroup.sync_login;
        groupIds.synchInfo.d.password = dGroup.sync_password;

        groupIds.d = dGroup._id;

        return groupIds;
    });
};
const CreateWorkstationsStub = (groupIds)=>{
    groupIds.workstations = {};
    groupIds.workstations.a = {
        wsId: toMD5('test_workstation_a'),
        group: groupIds.a
    };

    return Workstation.create({
        name: 'Test Workstation A',
        application: 'test app',
        wsId: toMD5('test_workstation_a'),
        group: groupIds.a
    })
    .then(()=>{
        groupIds.workstations.b = {
            wsId: toMD5('test_workstation_b'),
            group: groupIds.b
        };

        return Workstation.create({
            name: 'Test Workstation B',
            application: 'test app',
            wsId: toMD5('test_workstation_b'),
            group: groupIds.b
        });
    })
    .then(()=>{
        groupIds.workstations.c = {
            wsId: toMD5('test_workstation_c'),
            group: groupIds.c
        };

        return Workstation.create({
            name: 'Test Workstation C',
            application: 'test app',
            wsId: toMD5('test_workstation_c'),
            group: groupIds.c
        });
    });
};

const fillDataBase = ()=>{
    let data;

    return clearBD()
    .then(()=>{
        return CreateGroupsStub();
    })
    .then((groupStub)=>{
        data = groupStub;
        return CreateWorkstationsStub(data);
    })
    .then(()=>{
        return data;//CreateUsersStub(data);
    })
    .catch(err=>{
        console.log('fillDataBase - ', err);
    });
};

const fillDataBaseUsers = ()=>{
    let data;

    return clearBD()
    .then(()=>{
        return CreateGroupsStub();
    })
    .then((groupStub)=>{
        data = groupStub;
        return CreateWorkstationsStub(data);
    })
    .then(()=>{
        return CreateUsersStub(data);
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.clearBD = clearBD;
exports.fillDataBase = fillDataBase;
exports.fillDataBaseUsers = fillDataBaseUsers;
