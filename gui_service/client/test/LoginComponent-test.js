describe('Component: login', function () {
    beforeEach(module('remoteGuiApp'));
    beforeEach(module('/src/modules/login/login.html'));

    let scope;
    let element;
    let controller;

    beforeEach(inject(function($rootScope, $compile) {
        element = angular.element('<login></login>');
        scope = $rootScope.$new();
        $compile(element)(scope);
        scope.$digest();
    }));

  it('Controller fields', function(done) {
      let loginInput = element.find("input[name='login']");
      expect(loginInput).exist;
      //expect(loginInput.text()).equal('Admin');
      //loginInput.text('Admin');
      
      let passwordInput = element.find("input[name='password']");
      expect(loginInput).exist;
      //expect(loginInput.text()).equal('123456');

      done();
  });
});
