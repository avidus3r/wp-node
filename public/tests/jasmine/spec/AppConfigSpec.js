var configSchema = require('../src/schemas/config');
describe('App Config', function(){
    var appConfig;

    beforeEach(function(done){

        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function(){
            appConfig = JSON.parse(this.responseText);
            done();
        });
        oReq.open("GET", "http://local.altdriver.com:3000/appdata/config.json", true);
        oReq.send();
    });

    it('should be resolved and be typeof object', function() {
        expect(typeof appConfig).toBe('object');
    });

    it('should have a property of "altdriver"', function() {
        expect(appConfig.hasOwnProperty('altdriver')).toBe(true);
    });

    it('should have a schema available', function() {
        var cfg = typeof configSchema === 'object' && configSchema.hasOwnProperty('appname');
        expect(cfg).toBe(true);
    });
});