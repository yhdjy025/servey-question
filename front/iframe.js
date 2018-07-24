var helper = new Helper();
helper.onCall();
window.writeClickDom = null;

var _iquestion = (function () {
    //添加一个答案
    $('body').on('click', '#edit-form .add-input', function () {
        var type = $(this).data('type');
        _iquestion.addInput(this, type);
    })
    //删掉一个答案
    $('body').on('click', '#edit-form .remove-input', function () {
        $(this).parents('.input-group').remove();
    })
    //获取点击元素的xpath
    $('body').on('click', '#edit-form .get-xpath,#edit-form .get-answer,#edit-form .get-title', function () {
        window.writeClickDom = this;
        helper.callTop(window.parent, '_question.getClickDom');
    })

    return {
        //添加一个答案
        addInput: function (obj, type) {
            if (1 == type) {
                var input = '<div class="input-group form-group">' +
                    '<div class="col-xs-6"><input type="text" name="xpath" class="form-control input-sm" value="" placeholder="xpath"></div>' +
                    '<div class="col-xs-6"><input type="text" name="value" class="form-control input-sm" value="" placeholder="值，填空需要"></div>' +
                    '<span class="input-group-btn">' +
                    '<button class="btn btn-info btn-sm get-xpath">获取</button>' +
                    '<button class="btn btn-danger btn-sm remove-input">删除</button>' +
                    '</span>' +
                    '</div>';
            } else {
                var input = '<div class="input-group form-group">' +
                    '<input type="text" name="answer" class="form-control input-sm" value="" placeholder="答案">' +
                    '<span class="input-group-btn">' +
                    '<button class="btn btn-info btn-sm get-answer">获取</button>' +
                    '<button class="btn btn-danger btn-sm remove-input">删除</button>' +
                    '</span>' +
                    '</div>';
            }
            $(obj).parent('.form-group').before(input);
        },

        //写入点击元素的xpath或text
        writeClickResult(params) {
            var dom = window.writeClickDom;
            if (null == dom) return false;
            if ($(dom).hasClass('get-xpath')) {
                $(dom).parents('.input-group').find('input[name=xpath]').val(params.xpath);

            } else if ($(dom).hasClass('get-answer')) {
                $(dom).parents('.input-group').find('input[name=answer]').val(params.text);

            } else if ($(dom).hasClass('get-title')) {
                $(dom).parents('.input-group').find('input[name=title]').val(params.text);
            }
        }
    };
})();