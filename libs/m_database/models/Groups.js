var mongoose = require('m_mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({

  name:{
    type: String,
    //unique: true,?
    required: true
  },

  parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: null
  },

  ancestors: {
      type: [{
          type: Schema.Types.ObjectId,
          ref: 'Group'
      }]
  },

  sync_login:{
      type: String
      //unique: true,
  },

  sync_password:{
      type: String
  },

  description: {
      type: String
  }
});

const fillGroup = (group, data)=>{
    if(data.name)
        group.name = data.name;
    if(data.sync_login)
        group.sync_login = data.sync_login;
    if(data.sync_password)
        group.sync_password = data.sync_password;
    if(data.description)
        group.description = data.description;
    if(data.parent_id)
        group.parent_id = data.parent_id;
};

groupSchema.methods.getPublicFields = function() {
    let result = { _id: this._id};

    if(this.name) result.name = this.name;
    if(this.sync_login) result.sync_login = this.sync_login;
    if(this.description) result.description = this.description;
    if(this.parent_id) result.parent_id = this.parent_id;
    if(this.ancestors) result.ancestors = this.ancestors;

    return result;
};

groupSchema.statics.ReplaceGroup = (oldGId, newGId)=>{
    let oldGr;
    let newGr;
    return mongoose.models.Group.findOne({_id: oldGId})
    .then(group=>{
        if(!group)
            //throw new Error(`Group ${newGId} not exist!`);
            throw new Error(`normal`);

        oldGr = group;
        return mongoose.models.Group.findOne({_id: newGId});
    })
    .then(group=>{
        if(!group)
            //throw new Error(`Group ${newGId} not exist!`);
            throw new Error(`normal`);

        newGr = group;
        return mongoose.models.Group.find({parent_id: oldGId});
    })
    .then((groups)=>{
        return Promise.all(groups.map(group=>{

            if(oldGr){
                let index = oldGr.ancestors.findIndex(id=>id.equals(group._id));
                if(index !== -1)
                    oldGr.ancestors.splice(index,1);
            }

            if(newGr){
                newGr.ancestors.push(group._id);
            }

            group.parent_id = newGId;
            return group.save();
        }));
    })
    .then(()=>{
        return Promise.all([oldGr.save(), newGr.save()])
        .then(()=>{return true;});
    })
    .catch(err=>{
        if(err.message !== 'normal')
            throw err;
    });
};

groupSchema.statics.GetRootGroupId = ()=>{
    return mongoose.models.Group.findOne({parent_id: null})
    .then(group=>{
        return group._id;
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

groupSchema.statics.GetAncestorsIds = (id)=>{
    let grouIds = [];
    return mongoose.models.Group.findOne({_id: id})
    .then(group=>{
        if(!group)
            return [];

        if(group.ancestors.length) {
            grouIds = grouIds.concat(group.ancestors);
        }

        return group.ancestors;
    })
    .then(ancestors=>{
        return Promise.all(ancestors.map(id=>{
            return mongoose.models.Group.GetAncestorsIds(id);
        }));
    })
    .then(results=>{
        results.forEach(res=>{
            grouIds = grouIds.concat(res);
        });

        return grouIds;
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

const parentIds = (id, ids)=>{
    return mongoose.models.Group.findOne({_id: id})
    .then(group=>{
        if(group.parent_id){
            ids.push(group.parent_id);
            return parentIds(group.parent_id, ids);
        } else
            return ids;
    });
};

groupSchema.statics.GetParentsIds = (id)=>{
    let pIds = [];
    return mongoose.models.Group.findOne({_id: id})
    .then(group=>{
        if(!group)
            return [];

        if(group.parent_id){
            pIds.push(group.parent_id);
            return parentIds(group.parent_id, pIds);
        } else
            return [];
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

groupSchema.statics.Delete = (id)=>{
    let parentId;
    let removedGroup = null;
    return mongoose.models.Group.findOne({_id: id})
    .then(group=>{
        //console.log('Remove group ', id , group.name);
        if(!group){
            throw new Error('Impossible delete not exist group!');
        }
        removedGroup = group;
        parentId = removedGroup.parent_id;
        return mongoose.models.Group.remove({_id: removedGroup._id});
    })
    .then(result=>{
        parentId = removedGroup.parent_id;
        return Promise.all(removedGroup.ancestors.map(grId=>mongoose.models.Group.Delete(grId)));
    })
    .then(results=>{
        return mongoose.models.Group.findOne({_id: parentId})
    })
    .then(parentGroup=>{
        if(!parentGroup)
            return null;
        else {
            let index = parentGroup.ancestors.findIndex(id=>id.equals(removedGroup._id));

            if(index !== -1){
                parentGroup.ancestors.splice(index, 1);
                return parentGroup.save();
            } else
                return null;
        }
    })
    .then(()=>{
        return mongoose.models.User.find({groups_ids: { $in: [removedGroup._id]}});
    })
    .then((users)=>{
        return Promise.all(users.map(user=>{
            let index = user.groups_ids.findIndex(grId=>grId.equals(removedGroup._id));
            if(index !== -1){
                user.groups_ids.splice(index, 1);
            }
            return user.save();
        }))
        .then(results=>{
            //console.log('Remove group users result - ', results);
            return Promise.all(results.map(user=>{
                if(!user.groups_ids.length)
                    return user.remove();
                else
                    return user;
            }))
        });
    })
    .then(results=>{
        return removedGroup;
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

groupSchema.statics.Create = (obj)=>{
    let group = new mongoose.models.Group();
    let savedGroup = null;

    fillGroup(group, obj);

    return group.save()
    .then(group=>{
        savedGroup = group;
        if(!group.parent_id)
            return null;
        else
            return mongoose.models.Group.findOne({_id: group.parent_id});
    })
    .then(parentGroup=>{
        if(!parentGroup)
            return null;
        else if(parentGroup.ancestors.findIndex(id=>id.equals(group._id)) === -1){
            parentGroup.ancestors.push(group._id);
            return parentGroup.save();
        } else
            return null;
    })
    .then(()=>{
        return savedGroup;
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

groupSchema.statics.Update = (id, obj)=>{
    const Group = mongoose.models.Group;
    let savedGroup = null;
    let parentChanged = false;

    Group.findOne({_id: id}).
    then(group=>{

        if(group.parent_id && obj.parent_id && !group.parent_id.equals(obj.parent_id)){
                parentChanged = true;
                group.ancestors = [];
        }
        fillGroup(group, obj);
        return group.save();
    })
    .then(group=>{
        savedGroup = group;
        if(!group.parent_id || !parentChanged)
            return null;
        else
            return mongoose.models.Group.findOne({_id: group.parent_id});
    })
    .then(parentGroup=>{
        if(!parentGroup)
            return null;
        else if(parentGroup.ancestors.findIndex(id=>id.equals(group._id)) === -1){
            parentGroup.ancestors.push(group._id);
            return parentGroup.save();
        } else
            return null;
    })
    .then(()=>{
        return savedGroup;
    })
    .catch(err=>{
        console.log('Error: ', err);
    });
};

module.exports = mongoose.model('Group', groupSchema);
