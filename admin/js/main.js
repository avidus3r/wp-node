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
                $('.card-selector:eq(' + ind + ') option[value=' + item.type + ']').attr('selected', 'selected');
            });
        });
    },
};

var userInteractions = {
    init: function() {
        this.listenerCardAmount();
        this.updateConfig();
        this.listenerTypeChange();
    },
    listenerCardAmount: function() {
        $('#card-amount').on('change', function() {
            config.cardAmount = $(this).val();
            utilities.adjustCardSelectors(config.cardAmount);
        });
    },
    updateConfig: function() {
        $('#configUpdate').on('click', function() {
            config.cards = [];
            $('.card-selector').each(function(ind, item) {
                var value = $(item).val();
                console.log(value);
                config.cards.push({
                    type: value
                });
            });
            console.log(config);
            var request = utilities.updateData(baseUrl + '/apiV2/config/post-config', config);
            request.done(function(res) {
                console.log(res);
            });
        });
    },
    listenerTypeChange: function() {
        $(document).on('change','.card-selector', function() {
            var ind = $(this).index() - 1;
            var value = $(this).val();
            console.log(ind);
            $('.card:eq(' + ind + ')').text(value);
        });
    }
};

$(function() {
    pageLoad.init();
    userInteractions.init();
});