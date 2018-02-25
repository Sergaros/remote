angular.module('remoteGuiApp')
.factory('TreeService', function ($resource, localStorageService, MLog) {
    const _tree = new Tree();

    const GroupManager = $resource("api/group_manager/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: false }});
    const Group = $resource("api/groups/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});
    const Workstation = $resource("api/workstations/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});

    const isGroup = (item)=>{
        return item && !('wsId' in item);
    };

    const addClass = (item)=>{
        if(isGroup(item))
            item.class = 'list-group-item  fa fa-folder';
        else
            item.class = 'list-group-item  fa fa-desktop';
    };

    let _content = [];
    let _groups = [];

    const fillTree = ()=>{
        //console.log('_content - ', _content);
        _tree.columns = [];
        for (let i = 0; i < _content.length; i++) {
            //console.log('Add column - ',  _content[i]);
            _tree.add({
                items: _content[i],
                number: i
            });
        }
    };

    const refresh = ()=>{
        let content = [];

        return GroupManager.query({}).$promise.then(data=>{
            data.items.forEach(addClass);
            content.push(data.items);
            //console.log('content - ', content);
        })
        .then(()=>{
            return Group.query({}).$promise
            .then(groups=>{
                //console.log('groups - ', groups);
                _groups = groups;
                _content = content;
            });
        })
        .then(()=>{
            if(_tree.state.length){
                return restoreTree();
            }
        })
        .then(fillTree)
        .catch(MLog.error);
    };



    const restoreColumn = (group, number)=>{
        let manager = new GroupManager({_id: group});
        return manager.$get()
        .then(data=>{
            data.items.forEach(addClass);
            return data.items;
        });
    };

    const restoreTree = ()=>{
        let sequence = Promise.resolve();
        let data = [];

        _tree.state.forEach((value, index)=>{
            sequence = sequence.then(function() {
              return restoreColumn(value, index).then(res=>{
                 data.push(res);
              });
            });
        })

        return sequence.then(()=>{
            _content.splice(1);
            _content = _content.concat(data);

            _tree.state.forEach((value, index)=>{
                let selectItem = _content[index].find(item=>item._id===value);
                if(selectItem) {
                    selectItem.active = true;
                }
            });
        });

    };

    const open = (item, number)=>{
        _tree.open(number, item._id);
        _tree.delete(number);
        _content.splice(number+1);

        /*if(_tree.current)
            _tree.previous.push(_tree.current._id);*/

        _tree.current = item;

        if(isGroup(item)){
            item.treeType = 'group';
            let manager = new GroupManager({_id: item._id});
            manager.$get()
            .then(data=>{
                if(data.items.length){
                    data.items.forEach(addClass);
                    _content.push(data.items);
                    fillTree();
                }
            });
        }
    };

    const deleteCurrentGroup = ()=>{
        let manager = new GroupManager({_id: _tree.current._id});
        return manager.$delete()
        .then(()=>{
            _tree.path.pop();
            _tree.state.pop();
        });
    };

    const deleteCurrentWorkstation = ()=>{
        let workstation = new Workstation({ _id: _tree.current._id});
        return workstation.$delete()
        .then(()=>{
            _tree.path.pop();
            _tree.state.pop();
        });
    };

    const saveStateByName = (name)=>{
        localStorageService.set(name, {
            state: _tree.state,
            current: _tree.current,
            path: _tree.path
        });
    };

    const removeFromState = (name, id)=>{
        let data = localStorageService.get(name);

        if(data){
            let index = data.state.findIndex(item=>item===id);
            if(index !== -1){
                data.state = data.state.splice(index);
                data.path = [];
            }

            if(data.current._id===id){
                data.current = null;
            }

            _tree.state = data.state;
            _tree.current = data.current;
            _tree.path = data.path;

            saveStateByName(name);
        }


    };

    const loadStateByName = (name)=>{
        let data = localStorageService.get(name);

        if(data){
            _tree.state = data.state;
            _tree.current = data.current;
            _tree.path = data.path;
        }
    };

    const getGroupById = (id)=>{
        let group = new Group({ _id: id});
        return group.$get();
    };

    const openWorkstation = (name, wid)=>{
        let workstation = new Workstation({ _id: wid});

        return workstation.$get()
        .then((wst)=>{
            if(wst){
                _tree.current = wst;
                _tree.state = [wst._id];
                _tree.path = [wst.name];

                let gr = wst.group;
                let sequence = Promise.resolve();

                const resolveGroup = (id)=>{
                    return getGroupById(id)
                    .then(group=>{
                        if(group){
                            _tree.state.unshift(group._id);
                            _tree.path.unshift(group.name);

                            if(group.parent_id){
                                sequence = sequence.then(()=>{return resolveGroup(group.parent_id._id);})
                                return sequence;
                            }
                        } else
                            return sequence;
                    })
                };

                return resolveGroup(gr._id)
                .then(()=>{
                    return saveStateByName(name);
                })
                .catch(MLog.error);
            }
        })
    };

    return {
        refresh: refresh,
        restore: restoreTree,
        open: open,
        deleteCurrentGroup: deleteCurrentGroup,
        deleteCurrentWorkstation: deleteCurrentWorkstation,
        saveStateByName: saveStateByName,
        loadStateByName: loadStateByName,
        openWorkstation: openWorkstation,
        removeFromState: removeFromState,
        tree: ()=>_tree,
        options: ()=>{
            return {
                conten: _content,
                groups: _groups
            };
        }
    }
});
