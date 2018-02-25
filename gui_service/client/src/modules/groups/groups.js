'use strict'

angular.module('remoteGuiApp')
.component('groups', {
    controller: function ($resource, $http, md5, dialog, MLog) {
        const Group = $resource("api/groups/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});

        const $ctrl = this;

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

        //paginator
        $ctrl.maxSize = 10;
        $ctrl.items_per_page = 10;

        $ctrl.pageChanged = ()=>{
            let start = ($ctrl.currentPage-1)*$ctrl.items_per_page;
            let end = start + $ctrl.items_per_page;
            $ctrl.pageData = $ctrl.groups.slice(start, end);
        };

        $ctrl.groupsRefresh = ()=>{
            const getGroupsList = (data)=>{
                console.log('groups data - ', data);
                $ctrl.groups = data;

                $ctrl.totalItems = this.groups.length;
                $ctrl.currentPage = 1;
                $ctrl.pageChanged();
            };

            Group.query({}).$promise.then(getGroupsList, MLog.error);
        };

        $ctrl.groupsRefresh();

        //add group
        $ctrl.openGroupAddDialog = ()=> {
            return dialog.open({title: "Add Group",
                        contentUrl: "/src/modules/groups/groups.dialog.html",
                        result: {parent_id: $ctrl.groups[0]._id, groups: $ctrl.groups}
                    })
            .then((result)=>{
                if(result.sync_password)
                    result.sync_password =  md5.createHash( result.sync_password);

                let group = new Group(result);
                return group.$save()
                        .then($ctrl.groupsRefresh, MLog.error);
            }, ()=> {/*cancel*/})
            .catch(MLog.error);
        };

        //show details
        $ctrl.openDetailsDialog = (id)=>{
            let group = new Group({ _id: id});
            return group.$get()
            .then(group=>{
                return dialog.open({title: "Group Details",
                            contentUrl: "/src/modules/groups/groups.details.dialog.html",
                            result: group,
                            cancel: false
                        })
                .then((result)=>{
                    console.log('ok');
                }, ()=> {
                  console.info('modal-component dismissed at: ' + new Date());
                });
            })
            .catch(MLog.error);
        };

        //edit group
        $ctrl.openEditDialog = (id)=>{

            let group = new Group({ _id: id});
            return group.$get()
            .then(group=>{
                //remove self
                if(group.parent_id) {
                    group.groups=$ctrl.groups.filter(gr=>gr._id!==id);
                    group.parent_id = group.parent_id._id;
                }

                return dialog.open({
                        title: "Edit Group",
                        contentUrl: "/src/modules/groups/groups.dialog.html",
                        result: group
                    }).then((result)=> {
                        return result;
                    },()=>{
                        return null;
                    });
            })
            .then(result=>{
                if(result){
                    let group = new Group({_id: id});
                    fillGroup(group, result);
                    return group.$update().then($ctrl.groupsRefresh, MLog.error);
                } else return null;
            })
            .catch(MLog.error);
        };

      //remove group
      $ctrl.removeGroup = (id)=>{
          let dependencies;
          let newParentId;

          return dialog.open({title: "Remove Group", info: "Are you sure want to remove this group?"})
          .then(()=>{
              return  $http.get('/api/groups/dependencies/'+id);
          },()=>{})
          .then(result=>{
              console.log('Remove group dependencies - ', result);
              dependencies = result;
              let group = new Group({ _id: id});
              return group.$get();
          })
          .then(group=>{

              if(group.ancestors.length) {
                  let result = {};

                   //remove self
                  result.groups=$ctrl.groups.filter(gr=>gr._id!==id);

                  //remove ancestors
                  group.ancestors.forEach(group=>{
                      result.groups=result.groups.filter(gr=>gr._id!==group._id);
                  });


                  return dialog.open({title: "Set new parent group",
                              contentUrl: "/src/modules/groups/groups.delete.dialog.html",
                              result: result
                  })
                  .then(result=>{
                      console.log('Set new parent - ', result);
                      return result.parent_id;

                  },()=>{
                      console.log('Cancel set new parent - ', result);
                      return null;
                  })
              } else
                return null;
          })
          .then(result=>{
              console.log('Delete group result - ', result);
              if(result){
                  return $http.post('/api/groups/parentswap', {oldid: id, newid: result});
              } else {
                  return null;
              }
          })
          .then(result=>{
              let group = new Group({ _id: id});
              return group.$delete().then($ctrl.groupsRefresh, MLog.error);
          })
          .catch(MLog.error);
      };
    },
    templateUrl: '/src/modules/groups/groups.html'
});
