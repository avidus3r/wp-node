describe('Upload', function() {

    it('upload button should be present', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var uploadButton = element(by.css('.btn-submit-story'));
            expect(uploadButton.isPresent()).toBe(true);
        });
    });

    it('upload feilds should be present', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var uploadButton = element(by.css('.btn-submit-story'));
            uploadButton.click().then(function() {
                expect(element(by.css('#file-upload')).isPresent()).toBe(true);
                expect(element(by.css('#link-url')).isPresent()).toBe(true);
                expect(element(by.css('.email-field')).isPresent()).toBe(true);
                expect(element(by.css('#name')).isPresent()).toBe(true);
                expect(element(by.css('.btn-primary')).isPresent()).toBe(true);
            });
        });
    });

    it('upload should require link', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var uploadButton = element(by.css('.btn-submit-story'));
            var submitButton = null;
            uploadButton.click().then(function() {
                submitButton = element(by.css('.btn-primary'));
                element(by.css('.email-field')).sendKeys('email@email.com');
                element(by.css('#name')).sendKeys('name name');
                element(by.css('#link-url')).sendKeys('https://www.youtube.com/watch?v=kKaq9WfV_js');
                submitButton.click().then(function() {
                    expect(submitButton.isPresent()).toBe(false);
                });
            });
        });
    });

});