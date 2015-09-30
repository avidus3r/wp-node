$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var App = {
    cards: [],

    init: function(){
        var self = this;
        var request = self.getData('/appdata/feed.conf.json');

        request.done(function(res){
            $(res).each(function(index, item){
                self.cards.push(item);
            });

            self.render();
        });

        var btnSave = $('#save');
        var btnAdd = $('#add').find('li');
        var formAddCard = $('#newCard');

        btnSave.on('click', function(e){
            e.preventDefault();
            self.save();
        });

        btnAdd.on('click', function(e){
            var cardType = $(e.currentTarget).attr('id');

            if($(e.currentTarget).hasClass('generic-card')) cardType = 'generic';
            var placeHolderCard = $('#cardPlaceholder-'+ cardType);
            formAddCard.html(placeHolderCard.children());
            if(cardType === 'generic'){
                formAddCard.find('p.type').append($('<input />').attr({type:'text','value':$(e.currentTarget).attr('id'), 'disabled':'disabled'}));
                formAddCard.append($('<input />').attr({'type':'hidden', name:'type', value:$(e.currentTarget).attr('id')}));
            }

            $('#modal').modal();

            var btnOk = $('button[name="ok"]');

            btnOk.on('click', function(e){
                self.update();
                $('#modal').modal('hide');
            });

            var textField = formAddCard.find('input[type="text"]');
            var focusIndex = cardType === 'generic' ? 1 : 0;

            /*textField.focus();

            textField.on('keyup', function(e){
                var keyCode = e.keyCode || e.which;
                console.log(keyCode);
                switch(keyCode){
                    case 32:
                        $(e.currentTarget).val($(e.currentTarget).val().replace(' ','-'));
                        return false;
                        break;
                }
            });

            textField.on('blur', function(e){
                $(e.currentTarget).val($(e.currentTarget).val().toLowerCase());
            });*/

        });
    },

    getData: function(url){
        var dfd = new $.Deferred;

        $.get(url, function(res){
            dfd.resolve(res);
        });

        return dfd.promise();
    },

    render: function(){
        var self = this;
        var form = $('#formContent');
        form.html('');
        self.cards.forEach(function(item, index, collection){
            var card = item.card;
            var row = $('<fieldset />')
                .append(
                $('<legend />').text('Card: ' + card.type.toUpperCase())
            );

            for(var prop in card){
                var fieldName = prop;
                var fieldValue = card[prop];
                var fieldType = null;
                var input = null;

                switch(prop){
                    case 'perPage':
                        fieldType = 'checkbox';
                        input = $('<input />').attr({type: fieldType, name: fieldName, checked: 'checked'});
                        break;
                    case 'html':
                        fieldType = 'textarea';
                        input = $('<textarea />').attr({name: fieldType}).val(fieldValue);
                        break;
                    case 'count':
                    case 'position':
                        fieldType = 'number';
                        input = $('<input />').attr({type: fieldType, name: fieldName, value: fieldValue});
                        break;
                    case 'type':
                    case 'name':
                    case 'permalink':
                        fieldType = 'text';
                        input = $('<input />').attr({type: fieldType, name: fieldName, value: fieldValue});
                        break;
                }

                var field = $('<p />')
                    .attr('class', fieldName)
                    .append(
                        $('<label />')
                            .attr('for',fieldName)
                            .text(fieldName).css({'text-transform': 'capitalize'})
                    )
                    .append(input)
                    .appendTo(row);

                row.append(field);
            }

            form.prepend($('<section />').attr('class','card').css({order:index}).append(row));

        });
    },

    update: function() {
        var self = this;
        var newCard = {
            'card': $('#newCard').serializeObject()
        };
        self.cards.push(newCard);
        self.render();
        self.save();
    },

    save: function() {
        var self = this;
        var cards = {};

        var card = Object.assign(self.cards, cards);

        $.ajax({
            type: 'POST',
            url: '/admin',
            dataType:'json',
            headers:{'Content-Type':'application/json'},
            data: JSON.stringify(card),
            success: function (res) {

                self.render();
            }
        });
    }
};

$(function() {
    App.init();
});