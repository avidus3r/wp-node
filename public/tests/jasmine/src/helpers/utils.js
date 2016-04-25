'use strict';

var ResponseValidator = {
    schema:null,
    validate: function(schema, responseObject){
        var self = this;
        self.schema = schema;
        self.responseObject;

        self._validate();

        /*
         var pass = self._validate(schema, obj);
         return Promise.all(self.promises, function(results){
         for(var result of results){
         console.log(' ' + result);
         }
         });
         */
    },
    _validate: function(){
        var self = this;
        var schema = self.schema;
        var responseObject = self.responseObject;

        //iterate schema properties
        for(var schemaProp in schema){
            var schemaPropKey = schemaProp;
            var schemaPropVal = schema[schemaProp];

            if(typeof obj[prop] !== propObj.type && !Array.isArray(obj[prop])){
                var reason = typeof obj[prop] + ' was expected to be of type: ' + propObj.type;
                if(typeof obj[prop] === 'undefined') reason = 'missing property: ' + propName;
                reject(reason);
            }

            if(typeof obj[prop] === 'object' && !Array.isArray(obj[prop])){
                var schemaProps = propObj.properties;
                var objProps = obj[prop];
                self._validate(schemaProps, objProps);
            }

            if(Array.isArray(obj[prop])){
                var items = obj[prop];
                if(items.length !== propObj.items.length){
                    var reason = 'array items length does not match';
                    reject(reason);
                }
                for(i=0;i<items.length;i++){
                    if(typeof items[i] === 'object'){
                        var schemaProps = propObj.items[i].properties;
                        var objProps = items[i];
                        self._validate(schemaProps, objProps);
                    }
                }
            }
        }
    },
    validateArray: function(arr){

    },
    validateObject: function(schema, obj){
        var self = this;
        var pass;
        self.promises = [];
        self.promises.push(new Promise(function(fulfill, reject){
            for(var prop in schema){
                var propName = prop;
                var propObj = schema[prop];

                if(typeof obj[prop] !== propObj.type && !Array.isArray(obj[prop])){
                    var reason = typeof obj[prop] + ' was expected to be of type: ' + propObj.type;
                    if(typeof obj[prop] === 'undefined') reason = 'missing property: ' + propName;
                    reject(reason);
                }

                if(typeof obj[prop] === 'object' && !Array.isArray(obj[prop])){
                    var schemaProps = propObj.properties;
                    var objProps = obj[prop];
                    self._validate(schemaProps, objProps);
                }

                if(Array.isArray(obj[prop])){
                    var items = obj[prop];
                    if(items.length !== propObj.items.length){
                        var reason = 'array items length does not match';
                        reject(reason);
                    }
                    for(i=0;i<items.length;i++){
                        if(typeof items[i] === 'object'){
                            var schemaProps = propObj.items[i].properties;
                            var objProps = items[i];
                            self._validate(schemaProps, objProps);
                        }
                    }
                }
            }
            fulfill(true);
        }));
    }
};

module.exports = ResponseValidator;