describe('AppController', function(){
    beforeEach(angular.mock.module('NewsFeed'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    describe('$scope.isMobile', function(){
        var $scope, controller, $route;
        var count = 0;
        var userAgentStrings = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4',
            'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
            'Mozilla/5.0 (iPod touch; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53',
            '(Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36',
            'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)',
            'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+',
            'Mozilla/5.0 (webOS/1.0; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pre/1.0',
            'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
            'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
            'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))',
            'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
            'Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16'
        ];

        beforeEach(function() {
            $scope = {};
            $route = {};
            controller = $controller('AppController', { $scope: $scope, $route: $route });
        });

        afterEach(function(){
            count++;
        });

        it('should equal mobile iphone', function(){
            console.log($route);
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[0];});
            expect($scope.isMobile()).toEqual('ios mobile iphone');
        });
        it('should equal mobile ipad', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[1];});
            expect($scope.isMobile()).toEqual('ios mobile ipad');
        });
        it('should equal mobile ipod', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[2];});
            expect($scope.isMobile()).toEqual('ios mobile ipod');
        });
        it('should equal mobile android', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[3];});
            expect($scope.isMobile()).toEqual('mobile android');
        });
        it('should equal mobile iemobile', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[4];});
            expect($scope.isMobile()).toEqual('mobile iemobile');
        });
        it('should equal mobile blackberry', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[5];});
            expect($scope.isMobile()).toEqual('mobile blackberry');
        });
        it('should equal mobile webos', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[6];});
            expect($scope.isMobile()).toEqual('mobile webos');
        });
        it('should equal mobile opera-mini', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[7];});
            expect($scope.isMobile()).toEqual('mobile opera-mini');
        });
        it('should equal desktop safari', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[8];});
            expect($scope.isMobile()).toEqual('desktop safari');
        });
        it('should equal desktop chrome', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[9];});
            expect($scope.isMobile()).toEqual('desktop chrome');
        });
        it('should equal desktop msie', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[10];});
            expect($scope.isMobile()).toEqual('desktop msie');
        });
        it('should equal desktop firefox', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[11];});
            expect($scope.isMobile()).toEqual('desktop firefox');
        });
        it('should equal desktop opera', function(){
            navigator.__defineGetter__('userAgent', function(){return userAgentStrings[12];});
            expect($scope.isMobile()).toEqual('desktop opera');
        });
    });

    describe('$scope getTerms', function(){
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('AppController', { $scope: $scope });
        });

        it('should be defined', function(){
           expect($scope.getTerms()).toBeDefined();
        });
    });

    describe('$scope navItems', function(){
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('AppController', { $scope: $scope });
        });

        it('should be defined', function(){
            expect($scope.getTerms()).toBeDefined();
        });
    });

});