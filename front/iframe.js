window.callFunction = 'callIframe';
window.writeClickDom = null;

var loading_flag  = 0;

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
    $('body').on('click', '#edit-form .get-xpath,#edit-form .get-answer,#edit-form .get-title,#edit-form .get-random', function () {
        window.writeClickDom = this;
        helper.callTop('_question.getClickDom');
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
            } else if ($(dom).hasClass('get-random')) {
                helper.callTop('_question.getRandom', {xpath:params.xpath})
            }
        },
        //添加题目提交
        addQuestionSubmit: function (params) {
            if (loading_flag == 1) return false;
            var url = $('#edit-form').attr('action');
            var data = {
                _token: $('#edit-form').find('input[name=_token]').val(),
                title: $('#edit-form').find('input[name=title]').val(),
                type: $('#edit-form').find('input[name=type]:checked').val(),
                script: $('#edit-form').find('textarea[name=script]').val(),
                xpath: [],
                answer: []
            };
            $('#xpath-item').find('.input-group').each(function (i, v) {
                var kv = [
                    $(this).find('input[name=xpath]').val(),
                    $(this).find('input[name=value]').val()
                ];
                if (kv[0] != '') {
                    data.xpath.push(kv);
                }
            })
            $('#answer-item').find('.input-group').each(function (i, v) {
                var answer = $(this).find('input[name=answer]').val();
                if (answer != '') {
                    data.answer.push(answer);
                }
            })
            if (params.returnParams == true) {
                helper.callTop('_autoAnswer.findAnswer', data)
                return false;
            }
            if (data.title == '') {
                helper.layerMsg('题干不能为空');
            }
            loading_flag = 1;
            var loading_index = layer.load();
            $.post(url, data, function (ret) {
                loading_flag = 0;
                layer.close(loading_index);
                if (ret.status == 1) {
                    helper.layerMsg(ret.msg, 1, function () {
                        helper.callTop('helper.closeLayer');
                    });
                    return true;
                } else {
                    helper.layerMsg(ret.msg);
                    return false;
                }
            })
        },
    };
})();

var _isurvey = (function () {
    //搜索调查
    $('body').on('click', '#survey-search-btn', function () {
        var title = $('body').find('#survey-title-input').val();
        if ('' == title) {
            helper.layerMsg('标题不能为空', 0);
            return false;
        }
        var url = $(this).parents('form').attr('action');
        $.post(url, {title: title}, function (ret) {
            if (ret.status == 1) {
                $('body').find('#survey-list').html(ret.data);
            } else {
                helper.layerMsg(ret.msg, 0);
                return false;
            }
        })
    })
    //选择调查操作
    $('body').on('click', '#search-action tbody tr', function () {
        $('#search-action tbody tr').removeClass('bg-primary');
        $(this).addClass('bg-primary');
        $(this).find('input').attr('checked');
    })

    return {

        //调查添加选择入口
        save: function () {
            var action = $('#survey-option').find('.nav li.active').data('action');
            if (action == 'search') {
                _isurvey.selectSurvey();
            } else {
                _isurvey.addSurveySubmit();
            }
        },
        //添加调查提交
        addSurveySubmit: function () {
            if (loading_flag == 1) return false;
            var url = $('#edit-form').attr('action');
            var params = {};
            var foem = $('#edit-form').serializeArray();
            $.each(foem, function (i, v) {
                params[v.name] = v.value;
            })
            loading_flag = 1;
            var loading_index = layer.load();
            $.post(url, params, function (ret) {
                loading_flag = 0;
                layer.close(loading_index);
                if (ret.status == 1) {
                    helper.setStorage('select_survey', ret.data);
                    helper.layerMsg(ret.msg, 1, function () {
                        helper.callTop('helper.closeLayer');
                    });
                    return true;
                } else {
                    helper.layerMsg(ret.msg);
                    return false;
                }
            })
        },
        //选择调查
        selectSurvey: function () {
            var selected = $('#survey-list').find('tr.bg-primary');
            if (selected.length == 0) {
                helper.layerMsg('请选择一个调查');
                return false;
            }
            var survey = $(selected).data('survey');
            helper.setStorage('select_survey', survey);
            helper.layerMsg('select success', 1, function () {
                helper.callTop('helper.closeLayer');
            });
        },
    };
})();