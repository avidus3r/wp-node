describe('RestApiSpec', function() {
    var singlePostID = null;
    var posts = null;
    var post = null;
    var postName = null;
    var sponsors



    var endpoint = 'http://localhost:3000/api';

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true && JSON.stringify(obj) === JSON.stringify({});
    }

    //check sponsers 
    describe('check sponsors', function() {
        var url = endpoint + '/sponsors';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                sponsors = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(sponsors);
            expect(typeof sponsors).toBe('object');
        });

        it('should have more than 1 sponsors', function() {
            expect(sponsors.length).toBeGreaterThan(1);
        });

        // it('should have the correct properties', function() {
        //     propertiesMissing = false;
        //     for (var prop in sponsorsProperties) {
        //         if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
        //             propertiesMissing = true;
        //         }
        //     }
        //     expect(propertiesMissing).toBe(false);
        // });
    });

    //check sponsers 
    describe('check sponsor page', function() {
        var url = endpoint + '/sponsor/alt_driver'

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                sponsor = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(sponsor);
            expect(typeof sponsor).toBe('object');
        });

        it('should have more than 1 sponsors', function() {
            expect(sponsors.length).toBeGreaterThan(1);
        });

        // it('should have the correct properties', function() {
        //     propertiesMissing = false;
        //     for (var prop in sponsorsProperties) {
        //         if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
        //             propertiesMissing = true;
        //         }
        //     }
        //     expect(propertiesMissing).toBe(false);
        // });
    });


    //check campaigns 
    describe('check campaigns response', function() {
        var url = endpoint + '/campaigns';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                campaigns = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(campaigns);
            expect(typeof campaigns).toBe('object');
        });

    });

        //check campaigns 
    describe('check campaigns response', function() {
        var url = endpoint + '/campaigns';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                campaigns = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(campaigns);
            expect(typeof campaigns).toBe('object');
        });

    });

   	//check Menu 
    describe('check menu response', function() {
        var url = endpoint + '/menu';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(posts);
            expect(typeof posts).toBe('object');
        });

    });

});