describe('Factory: Authentication', function(){
    let auth;
    let httpBackend;

	beforeEach(function(){
		module('remoteGuiApp');
	});

        beforeEach(inject(function ($injector, $httpBackend) {
            httpBackend = $httpBackend;
            auth = $injector.get('Authentication');
        }));

        it('test isloggedin', function(){
            httpBackend.when('GET', '/isloggedin').respond(200, {result: false});
            auth.isLoggedIn();
            httpBackend.flush();
        });

        it('test logIn', function(){
            httpBackend.when('POST', '/login').respond(200, {result: true});
            auth.logIn('Admin', '123456');
            httpBackend.flush();
        });

        it('test logout', function(){
            httpBackend.when('GET', '/logout').respond(200, {result: true});
            auth.logOut();
            httpBackend.flush();
        });

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });
});
