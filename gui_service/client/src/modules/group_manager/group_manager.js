'use strict'

angular.module('remoteGuiApp')
.component('groupManager', {
    bindings: {
      actions: '<'
    },
    controller: function ($resource, $http, $q, md5, dialog, TreeService, MLog) {
        const $ctrl = this;
        const GroupManager = $resource("api/group_manager/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: false }});
        const Group = $resource("api/groups/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});
        const Workstation = $resource("api/workstations/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});

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

        $ctrl.onOpen = (item, path, content, groups)=>{
            $ctrl.currentItem = item;
            $ctrl.path = path;
            $ctrl.content = content;
            $ctrl.groups = groups;

            TreeService.saveStateByName('gmTreeState');
        };

        $ctrl.$onInit = ()=>{
            TreeService.loadStateByName('gmTreeState');
            $ctrl.path = TreeService.tree().path;
            $ctrl.currentItem = TreeService.tree().current;
        };

        //add group
        $ctrl.addGroupDialog = ()=> {
            let parentId = $ctrl.currentItem._id;
            return dialog.open({title: "Add Group",
                        contentUrl: "/src/modules/group_manager/groups.dialog.html",
                        result: {parent_id: parentId, groups: $ctrl.groups}
                    })
            .then((result)=>{
                if(result.sync_password)
                    result.sync_password =  md5.createHash(result.sync_password);

                let group = new Group(result);
                return group.$save()
                        .then(TreeService.refresh)
            })
            .catch(MLog.error);
        };

        //edit group
        $ctrl.editGroupDialog = ()=>{

            if($ctrl.currentItem.treeType === 'group'){
                let group = new Group({ _id: $ctrl.currentItem._id});
                return group.$get()
                .then(item=>{
                    //remove self
                    if(group.parent_id) {
                        group.groups=$ctrl.groups.filter(gr=>gr._id!==$ctrl.currentItem._id);
                        group.parent_id = group.parent_id._id;
                    }

                    return dialog.open({
                            title: "Edit Group",
                            contentUrl: "/src/modules/group_manager/groups.dialog.html",
                            result: group
                        }).then((result)=> {
                            return result;
                        },()=>{
                            return null;
                        });
                })
                .then(result=>{
                    if(result){
                        let group = new Group({_id: $ctrl.currentItem._id});
                        fillGroup(group, result);
                        return group.$update()
                            .then(TreeService.refresh)
                            .then(()=>{
                                $ctrl.path = TreeService.tree().path;
                            });
                    } else return null;
                })
                .catch(MLog.error);
            } else {
                let workstation = new Workstation({ _id: $ctrl.currentItem._id});
                return workstation.$get()
                .then(workstation=>{

                    let group = {};
                    group.parent_id = workstation.group._id;
                    group.groups=TreeService.options().groups;

                    return dialog.open({
                            title: "Edit Workstation",
                            contentUrl: "/src/modules/group_manager/workstation.dialog.html",
                            result: group
                        }).then((result)=> {
                            return result;
                        },()=>{
                            return null;
                        });
                })
                .then(result=>{
                    if(result){
                        return $http.post('/api/workstations/swapparent', {id: $ctrl.currentItem._id, groupId: result.parent_id})
                        .then(result=>{
                            if(result){
                                return TreeService.refresh()
                                .then(()=>{
                                    $ctrl.path = TreeService.tree().path;
                                });
                            }
                        });
                    } else return null;
                })
                .catch(MLog.error);
            }
        };

        //remove group
        $ctrl.deleteGroupDialog = ()=>{
            if($ctrl.currentItem.treeType === 'group'){
                let dependencies;

                return dialog.open({title: "Remove Group", info: "Are you sure want to remove this group?"})
                .then(()=>{
                    return  $http.get('/api/groups/dependencies/'+$ctrl.currentItem._id);
                })
                .then(result=>{
                    dependencies = result;

                    let manager = new GroupManager({_id: $ctrl.currentItem._id});
                    return manager.$get();
                })
                .then(group=>{
                    if(group.items.length) {
                        let result = {};

                         //remove self
                        result.groups=$ctrl.groups.filter(gr=>gr._id!==$ctrl.currentItem._id);

                        //remove ancestors
                        group.items.forEach(group=>{
                            result.groups=result.groups.filter(gr=>gr._id!==group._id);
                        });


                        return dialog.open({title: "Set new parent group",
                                    contentUrl: "/src/modules/groups/groups.delete.dialog.html",
                                    result: result
                        })
                        .then(result=>{
                            return result.parent_id;
                        },()=>{
                            return null;
                        })
                    } else
                      return null;
                })
                .then(result=>{
                    if(result){
                        return $http.post('/api/groups/parentswap', {oldid: $ctrl.currentItem._id, newid: result});
                    } else {
                        return null;
                    }
                })
                .then(result=>{
                    return TreeService.deleteCurrentGroup()
                    .then(TreeService.refresh)
                    .then(()=>{
                        $ctrl.path = TreeService.tree().path;
                    });
                })
                .catch(MLog.error);
            } else {
                return dialog.open({
                                       title: "Remove Workstation",
                                       info: "Are you sure want to remove this workstation?"
                                   })
                 .then(()=>{
                     return TreeService.deleteCurrentWorkstation()
                     .then(TreeService.refresh)
                     .then(()=>{
                         $ctrl.path = TreeService.tree().path;
                     });
                 },()=>null)
                 .catch(MLog.error);
            }
        };
    },
    templateUrl: '/src/modules/group_manager/group_manager.html'
});
