'use strict'

angular.module('remoteGuiApp')
.component('users', {
    controller: function ($element, $http, $resource, $log, dialog, MLog) {
        const User = $resource("api/users/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});
        const Group = $resource("api/groups/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});

        const $ctrl = this;


        $ctrl.usersRefresh = ()=>{
            $ctrl.table.ajax.reload();
        }

        $ctrl.afterInit = function () {
            let table = $element.find("table");
            $ctrl.table = table.DataTable({
                ajax: {
                    url: "/api/users",
                    dataSrc: ""
                },
                columns: [
                    {title: "Name", data: "name"},
                    {title: "Email", data: "email"},
                    {
                        title: "Actions",
                        sortable: false,
                        render: function (data, type, full, meta) {
                            return "<a class='action-edit'><span class='fa fa-pencil' aria-hidden='true'></span></a>&nbsp;<a class='action-del'><span class='fa fa-trash' aria-hidden='true'></span></a>";
                        }
                    }
                ],
                order: [[0, 'asc']],
                createdRow: function (row, data, index) {
                    $('a.action-edit', row).click(function () {
                        $ctrl.openEditDialog(data._id);
                    });
                    $('a.action-del', row).click(function () {
                        $ctrl.removeUser(data._id);
                    });
                }
            });
        };

        const getUserFields = (data)=>{
            let result = {};
            if(data.name) result.name = data.name;
            if(data.email) result.email = data.email;
            if(data.password) result.password = data.password;
            if(data.groups_ids) result.groups_ids = data.groups_ids;
            if(data.permissions) result.permissions = data.permissions;

            return result;
        };

        //add user
        this.openUserAddDialog = ()=> {
           let permsList = [];

           return $http.get('/permissions').then(result=>{
               if(Array.isArray(result.data))
                   permsList.push(...result.data);
               return Group.query({}).$promise;
           })
           .then(groups=>{
               return dialog.open({
                   title: "Add User",
                   contentUrl: "/src/modules/users/user.dialog.html",
                   result: {groups, permsList}
               });
           })
           .then(result=>result, ()=>null)
           .then((result)=>{
               if(result){
                   let udata = getUserFields(result);
                   let user = new User(udata);
                   return user.$save().then($ctrl.usersRefresh, MLog.error);
               } else
                   return null;
           })
           .catch(MLog.error);
        };

        //edit user
        this.openEditDialog = (id)=>{
            let groups;
            let permsList = [];

            return $http.get('/permissions').then(result=>{
                if(Array.isArray(result.data))
                    permsList.push(...result.data);
                return Group.query({}).$promise;
            })
            .then(result=>{
                groups = result;
                let user = new User({ _id: id});
                return user.$get();
            })
            .then(user=>{
                    $log.debug('Edit User Get - ', user);
                    let udata = getUserFields(user);
                    udata.groups = groups;
                    udata.permsList = permsList;
                    return dialog.open({
                        title: "Edit User",
                        contentUrl: "/src/modules/users/user.dialog.html",
                        result: udata})
                        .then(result=>result, ()=>null);
            })
            .then(result=> {
                if(result){
                    let udata = getUserFields(result);
                    udata._id = id;
                    let user = new User(udata);
                    return user.$update().then(this.usersRefresh, MLog.error);
                } else
                    return null;
            })
            .catch(MLog.error);
      };

      //remove user
      this.removeUser = (id)=>{
         return dialog.open({
                                title: "Remove User",
                                info: "Are you sure want to remove this user?"
                            })
          .then(()=>{
              let user = new User({ _id: id});
              return user.$delete().then(this.usersRefresh, MLog.error);
          },()=>null)
          .catch(MLog.error);
      };
    },
    templateUrl: '/src/modules/users/users.html'
});
