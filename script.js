$(document).ready(function () {


    //сформируем каталог на странице каталога
    function renderCat() {

        var basket = JSON.parse(localStorage.getItem("basket"));
        var cupon = JSON.parse(localStorage.getItem("cupon"));
        var cuponArr = [];

        $.getJSON('/coupon.json', function(data) {

            data.forEach(function(element) {
                if(element.id == cupon){
                    cuponArr = element;
                }
            });


            $.getJSON('/catalog.json', function(data) {

                data.forEach(function(element) {

                    if(basket && basket[element.id]){
                        var itemadd = '<div class="catal-item-add disabled">В корзине</div>';
                    }
                    else {
                        var itemadd = '<div class="catal-item-add add">Добавить</div>';
                    }

                    var endPrice = element.price;
                    var discount = '';

                    if(cuponArr.tov == 'all' || cuponArr.tov == element.id){
                        endPrice = endPrice * cuponArr.price / 100;
                        discount = ' discount';
                    }

                    var el = $('<div class="catal-item" data-id="'+ element.id +'">' +
                        '<img src="'+ element.img +'" alt="img">' +
                        '<div class="catal-item-name">' + element.name +'</div>' +
                        '<div class="catal-item-price'+ discount +'">'+ endPrice +' руб</div>' +
                        itemadd +
                        '</div>');

                    $('.catal-items').append(el);
                });
            });
        });

    }

    //если страница каталога
    if(document.location.pathname == '/'){
        renderCat();
    }


    //добавим товар в корзину со страницы каталога
    $(document).on('click', '.catal-item-add.add', function () {

        var id = $(this).closest('.catal-item').data('id');
        add2basket(id, 1);
    });




    //добавим/удалим товар в корзину
    function add2basket(id, count) {

        var basket = JSON.parse(localStorage.getItem("basket"));
        if(basket){
            basket[id] = count;
        }
        else {
            var basket = [];
            basket[id] = count;
        }

        var serial = JSON.stringify(basket);
        localStorage.setItem("basket", serial);

        save();
        location.reload();
    }



    //сформируем корзину на странице корзины
    function renderBasket() {

        var basket = JSON.parse(localStorage.getItem("basket"));
        var cupon = JSON.parse(localStorage.getItem("cupon"));
        var cuponArr = [];

        $.getJSON('/coupon.json', function(data) {

            data.forEach(function (element) {
                if (element.id == cupon) {
                    cuponArr = element;
                }
            });



            $.getJSON('/catalog.json', function(data) {
                data.forEach(function(element) {

                    if(basket && basket[element.id]){


                        var endPrice = element.price;
                        var discount = '';

                        if(cuponArr.tov == 'all' || cuponArr.tov == element.id){
                            endPrice = endPrice * cuponArr.price / 100;
                            discount = ' discount';
                        }


                        var el = '<div class="basket-item" data-id="'+element.id+'">' +
                            '<div class="basket-tov">' +
                            '<img src="'+element.img+'" alt="img">' +
                            '<div class="basket-item-name">'+element.name+'</div>' +
                            '</div>' +
                            '<div class="basket-item-price'+ discount +'">'+endPrice+' руб</div>' +
                            '<div class="basket-count">' +
                            '<div class="basket-m">-</div>' +
                            '<input type="text" value="'+basket[element.id]+'">' +
                            '<div class="basket-p">+</div>' +
                            '</div>' +
                            '<div class="basket-item-price full'+ discount +'">'+(endPrice * basket[element.id])+' руб</div>' +
                            '<div class="basket-del"></div>' +
                            '</div>';

                        $('.basket-items').append(el);
                    }
                });
            });
        });

    }

    //если страница корзины
    if(document.location.pathname == '/basket.html'){
        renderBasket();
    }


    //удаление из корзины
    $(document).on('click', '.basket-del', function () {

        var id = $(this).closest('.basket-item').data('id');
        add2basket(id, 0);
    });


    //сотрем не цифры в инпутах и изменим значение
    $(document).on('keyup', '.basket-count input', function () {

        var id = $(this).closest('.basket-item').data('id');

        var val = $(this).val();
        var num = parseInt(val.replace(/\D+/g,""));
        if(!num)
            num = '';
        $(this).val(num);

        add2basket(id, num);
    });


    //добавим на 1
    $(document).on('click', '.basket-p', function () {

        var id = $(this).closest('.basket-item').data('id');
        var value = $(this).siblings('input').val();
        value++;
        $(this).siblings('input').val(value);

        add2basket(id, value);
    });

    //убавим 1
    $(document).on('click', '.basket-m', function () {

        var id = $(this).closest('.basket-item').data('id');
        var value = $(this).siblings('input').val();
        value--;

        if(value > 0){
            $(this).siblings('input').val(value);
            add2basket(id, value);
        }
    });



    //применим купон если есть такой
    $(document).on('click', '.cupon-apply.appl', function () {

        var cupon = $('.cupon input').val();
        var textapply = '';
        var setCupon = localStorage.getItem("cupon");

        if(setCupon && !cupon){
            localStorage.removeItem("cupon");
            save();
            alert ('Купон удален');
            location.reload();
        }
        else {
            $.getJSON('/coupon.json', function(data) {
                data.forEach(function(element) {

                    if(element.id == cupon){
                        localStorage.setItem("cupon", cupon);
                        save();
                        textapply = 'Купон '+cupon+' применен';
                    }
                });

                if(!textapply){
                    alert ('Купон не найден');
                }
                else{
                    alert(textapply);
                    location.reload();
                }
            });
        }
    });


    //визуально показать что купон активирован
    function showCouponIfIsset() {
        var setCupon = localStorage.getItem("cupon");
        if(setCupon){

            $.getJSON('/coupon.json', function(data) {
                data.forEach(function(element) {

                    if(element.id == setCupon){
                        
                        $('.cupon-apply').text('Отменить');
                        $('.cupon input')
                            .attr('placeholder', 'Применен '+setCupon+' ('+element.name+')')
                            .prop('disabled', true);
                    }
                });
            });
        }
    }
    showCouponIfIsset();



    //чек
    $(document).on('click', '.print', function () {
        $('body').append('<div id="tmp"></div>');

        var print = '<div>Чек</div><br />';
        $(document).find('.basket-item-name, .basket-item-price.full').each(function (e) {
            print += $(this).html() + '<br>';
        });
        print += '<br>';

        var cost = 0;
        $(document).find('.basket-item-price.full').each(function (e) {
            cost += parseInt($(this).html());
        });

        print += '<div>Общая сумма: '+cost+'</div>';

        var iframe = $('<iframe id="pframe">');
        $('body').find('#tmp').append(iframe);

        //Объект document (в переменной doc) нам нужен для того, чтобы вывести в него данные для печати,
        //а window (в переменной win) — для того, чтобы вызвать саму печать.

        var doc = $('#pframe')[0].contentDocument || $('#pframe')[0].contentWindow.document;
        var win = $('#pframe')[0].contentWindow || $('#pframe')[0];
        doc.getElementsByTagName('body')[0].innerHTML = print;

        win.print();
        $('#tmp').remove();
    });



    //сохраним текущий шаг
    function save() {

        var stepSave = JSON.parse(localStorage.getItem("step"));
        if(!stepSave)
            stepSave = [];

        var step = [];
        step[0] = JSON.parse(localStorage.getItem("basket"));
        step[1] = JSON.parse(localStorage.getItem("cupon"));


        //если совершили действие посередине дороги - затереть шаги
        var wasStep = localStorage.getItem("stepNow");
        if(wasStep && (parseInt(wasStep)) != stepSave.length){

            //console.log(parseInt(wasStep));
            //console.log(stepSave.length);

            var stepSavePre = [];
            stepSave.every(function(el, i) {
                stepSavePre[i] = el;

                if (i == parseInt(wasStep)+1) {
                    return false;
                }
                else {
                    return true;
                }
            });

            stepSave = stepSavePre;
            localStorage.setItem("stepNow", parseInt(wasStep)+1);
        }
        else {
            stepSave[stepSave.length] = step;
            localStorage.setItem("stepNow", parseInt(stepSave.length));
        }

        var serial = JSON.stringify(stepSave);
        localStorage.setItem("step", serial);
    }


    //перейти к шагу
    function goStep(step) {
        var stepSave = JSON.parse(localStorage.getItem("step"));
        if(stepSave[step]){

            var serialBasket = JSON.stringify(stepSave[step][0]);
            var serialCupon = JSON.stringify(stepSave[step][1]);
            localStorage.setItem("basket", serialBasket);
            localStorage.setItem("cupon", serialCupon);
            localStorage.setItem("stepNow", step);

            //localStorage.clear(); //включаю когда хочу тестировать заново
            location.reload();
        }
    }



    //предыдущий шаг
    $(document).on('click', '.undo', function () {
        var step = JSON.parse(localStorage.getItem("step"));
        var stepNow = localStorage.getItem("stepNow");

        if(step && stepNow != 0 && stepNow <= step.length){
            goStep(parseInt(stepNow)-1);
        }
    });

    //следующий шаг
    $(document).on('click', '.next', function () {
        var step = JSON.parse(localStorage.getItem("step"));
        var stepNow = localStorage.getItem("stepNow");

        if(stepNow && step && step[parseInt(stepNow)+1] && step.length > stepNow){
            goStep(parseInt(stepNow)+1);
        }
    });



    //начальная проверка есть ли можно ли кликать шаги
    function tryStep() {
        var step = JSON.parse(localStorage.getItem("step"));
        var stepNow = localStorage.getItem("stepNow");

        if(!step || stepNow == 0 || stepNow > step.length){
            $('.undo').addClass('disabled').attr('onclick', 'return false');
        }
        if(!stepNow || !step || !step[parseInt(stepNow)+1] || step.length <= stepNow){
            $('.next').addClass('disabled').attr('onclick', 'return false');
        }
    }
    tryStep();



    //начальная установка пустого шага,чтобы можно было откатывать самое первое дейтствие
    function zeroStep() {
        var stepNow = localStorage.getItem("stepNow");
        if(!stepNow)
            save();
    }
    zeroStep();

});