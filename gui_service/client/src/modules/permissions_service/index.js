angular.module('remoteGuiApp')
.factory('Permissions', function (localStorageService) {
    return {
        set: (perms)=>{
            localStorageService.set('permissions', perms);
        },
        check: (name)=>{
            let permissions = localStorageService.get('permissions');

            if(!Array.isArray(permissions))
                return false;
            else
                return permissions.findIndex(p=>p===name) !== -1;
        }
    }
});
