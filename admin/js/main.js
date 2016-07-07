var baseUrl = window.location.href.toString().replace('/admin', '');
var config = {};
var appConfig = {};

var utilities = {
    getData: function(url) {
        var dfd = new $.Deferred;

        $.get(url, function(res, err) {
            if(err) dfd.reject(err);
            dfd.resolve(res);
        });

        return dfd.promise();
    },
    updateData: function(url, body) {
        var dfd = new $.Deferred;

        $.ajax({
            url: url,
            data: body,
            type: 'PUT',
            success: function(res) {
                dfd.resolve(res);
            }
        });

        return dfd.promise();
    },
    render: function(data, template, dest) {
        var source = $('#' + template).html();
        var compiledTemplate = Handlebars.compile(source);
        var html = compiledTemplate(data);
        $('#' + dest).empty();
        $('#' + dest).append(html);
    },
    adjustCardSelectors: function(count) {
        var phoneyCards = [];
        for (var i = 0; i < count; i++) {
            phoneyCards.push({
                type: 'video'
            });
        }
        utilities.render(phoneyCards, 'card-selector-template', 'card-selector-container');
        utilities.render(phoneyCards, 'card-visual-template', 'visual-cards-container');
    },
    showModal: function(header, message) {
        $('.modal-title').text(header);
        $('.modal-body').text(message);
        $('#showModal').trigger('click');
    }
};

var pageLoad = {
    init: function() {
        this.getConfig();
        this.getClientConfig();
    },
    getConfig: function() {
        var request = utilities.getData(baseUrl + '/apiV2/config/post-config');
        var html = null;
        request.done(function(res) {
            console.log(res);
            config = res;
            utilities.render(res.cards, 'card-selector-template', 'card-selector-container');
            utilities.render(res.cards, 'card-visual-template', 'visual-cards-container');
            $('#card-amount').val(res.cardAmount);
            $.each(res.cards, function(ind, item) {
                console.log(res.cards);
                console.log(ind);
                var subIndex = ind + 1;
                $('.card-selector:eq(' + ind + ') option[value=' + item.type + ']').attr('selected', 'selected');
                $('.card-selector-label:eq(' + ind + ')').text('Card ' + subIndex);
                if (item.type == 'ad') {
                    var adIndex = item.hasOwnProperty('placementIndex') ? item.placementIndex : '';
                    $('.card-selector:eq(' + ind + ')')
                        .after($('<div/>').css({'margin':'0 0 1em 2em'})
                            .append($('<label/>').text('Placement Index').css({'display':'block'}))
                            .append($('<input/>').attr({'type':'number','placeholder':'0','class':'placement-index','value': adIndex}).css({'padding':'.5em'}) )
                        )
                }
            });
            $('#htmlText').val(res.html);
        });
    },
    getClientConfig: function() {
        var request = utilities.getData(baseUrl + '/apiV2/config/client-config');
        request.done(function(res) {
            console.log("resp:",res);
            appConfig = res;
            $.each(res.app, function(key, data) {
                $('#' + key).val(data);
            });
        });
    }
};

var userInteractions = {
    init: function() {
        this.listenerCardAmount();
        this.updateCards();
        this.revertCards();
        this.listenerTypeChange();
        this.updateHtml();
        this.revertHtml();
        this.updateConfig();
        this.appConfigUpdate();
        this.listnerHtmlTouch();
        this.showAppConfig();
    },
    listenerCardAmount: function() {
        $('#card-amount').on('change', function() {
            config.cardAmount = $(this).val();
            utilities.adjustCardSelectors(config.cardAmount);
        });
    },
    updateCards: function() {
        $('#cardsUpdate').on('click', function() {
            config.cards = [];
            $('.card-selector').each(function(ind, item) {
                var value = $(item).val();
                var def = $('.default-selector:eq(' + ind + ')').val();
                console.log(def);
                console.log(value);
                config.cards.push({
                    type: value,
                    default: def
                });
            });
            console.log(config);
            var request = utilities.updateData(baseUrl + '/apiV2/config/post-config', config);
            request.done(function(res) {
                if (res.success == true) {
                    utilities.showModal('Success', 'Cards have been updated');
                } else {
                    utilities.showModal('Error', res.errMessage);
                }
            });
        });
    },
    revertCards: function() {
        $('#cardsRevert').on('click', function() {
            utilities.render(config.cards, 'card-visual-template', 'visual-cards-container');
            $('#card-amount').val(config.cardAmount);
            $.each(config.cards, function(ind, item) {
                $('.card-selector:eq(' + ind + ') option[value=' + item.type + ']').attr('selected', 'selected');
            });
        });
    },
    listenerTypeChange: function() {
        $(document).on('change', '.card-selector', function() {
            var ind = $(this).data('index');
            var value = $(this).val();
            $('.card:eq(' + ind + ')').text(value);
            // if (value == 'sponsor') {
            //     $('.default-select:eq(' + ind + ')').show();
            // } else {
            //     $('.default-select:eq(' + ind + ')').hide();
            // }
        });
    },
    updateHtml: function() {
        $('#htmlUpdate').on('click', function() {
            config.html = $('#htmlText').val();
            var request = utilities.updateData(baseUrl + '/apiV2/config/html', config);
            request.done(function(res) {
                if (res.success == true) {
                    utilities.showModal('Success', 'HTML have been updated');
                } else {
                    utilities.showModal('Error', res.errMessage);
                }
            });
        });
    },
    revertHtml: function() {
        $('#htmlRevert').on('click', function() {
            $('#htmlText').val(config.html);
        });
    },
    updateConfig: function() {
        $('#configUpdate').on('click', function() {
            config.cards = [];
            $('.card-selector').each(function(ind, item) {
                var value = $(item).val();
                var def = $('.default-selector:eq(' + ind + ')').val();
                console.log(def);
                console.log(value);
                if(value === 'ad'){
                    var placementIndex = $(item).next().find('.placement-index').val();
                    config.cards.push({
                        type: value,
                        default: def,
                        placementIndex: placementIndex
                    });
                }else{
                    config.cards.push({
                        type: value,
                        default: def
                    });
                }
            });
            console.log(config);
            var request = utilities.updateData(baseUrl + '/apiV2/config/post-config', config);
            request.done(function(res) {

            });
            config.html = $('#htmlText').val();
            var request = utilities.updateData(baseUrl + '/apiV2/config/html', config);
            request.done(function(res) {

            });
            utilities.showModal('Success', 'config has been updated');
        });
    },
    listnerHtmlTouch: function() {
        $('#htmlText').click(function() {
            $('.html-button').show();
        });
    },
    appConfigUpdate: function() {
        $('#appConfigUpdate').click(function() {
            var name = $('#name').val();
            var newConfig = {
                'name': name,
                'app': {

                }
            };
            newConfig.app.pubads = appConfig.app.pubads;
            $('.app-config-input').each(function(ind, item) {
                var key = $(item).attr('id');
                var value = $(item).val();
                newConfig.app[key] = value;
            });
            var request = utilities.updateData(baseUrl + '/apiV2/config/client-config', newConfig);
            request.done(function(res) {

            });
            utilities.showModal('Success', 'app config has been updated');
        });
    },
    showAppConfig: function() {
        $('#appConfig').click(function(){
            $('.app-config').show();
        });
    }
};

$(function() {
    pageLoad.init();
    userInteractions.init();
});