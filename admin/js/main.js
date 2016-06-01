var baseUrl = window.location.href.toString().replace('/admin', '');
var config = {};

var utilities = {
    getData: function(url) {
        var dfd = new $.Deferred;

        $.get(url, function(res) {
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
                //$('.card-selector-label:eq(' + ind + ')').text('Card ' + subIndex);
                // if (item.type == 'sponsor') {
                //     $('.default-select:eq(' + ind + ')').show();
                // }
            });
            $('#htmlText').val(res.html);
        });
    },
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
                //var def = $('.default-selector:eq(' + ind + ')').val();
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
                //var def = $('.default-selector:eq(' + ind + ')').val();
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
                
            });
            config.html = $('#htmlText').val();
            var request = utilities.updateData(baseUrl + '/apiV2/config/html', config);
            request.done(function(res) {

            });
            utilities.showModal('Success', 'config has been updated');
        });
    }
};

$(function() {
    pageLoad.init();
    userInteractions.init();
});