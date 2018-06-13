var select_survey = 'https://survey.yhdjy.cn/chrome/selectSurvey';
var find_question = 'https://survey.yhdjy.cn/chrome/findQuestion';
var add_question = 'https://survey.yhdjy.cn/chrome/addQuestion';
layer.config({
    shade: false
});
window.isOpen = 0;

var _question = (function () {
    var _this = this;
    $('body').on('click', '#edit-form .add-input', function () {
        var type = $(this).data('type');
        _question.addInput(this, type);
    })

    $('body').on('click', '#edit-form .remove-input', function () {
        _question.removeInput(this);
    })

    return {
        addQuestion: function (title) {
            chrome.storage.sync.get('select_survey', function (data) {
                if (data.select_survey) {
                    if (data.select_survey.script != '' && !title) {
                        eval(data.select_survey.before);
                        console.log(title)
                    }
                    var url = add_question + '/' + data.select_survey.id + '?title=' + (title ? title : '');
                    $.get(url, function (ret) {
                        layer.open({
                            type: 1,
                            title: '添加题目',
                            area: ['700px', '400px'],
                            btn: ['确定', '取消'],
                            maxmin: true,
                            moveOut: true,
                            content: ret,
                            yes: function (index) {
                                _question.addQuestionSubmit(index);
                            },
                            btn2: function (index) {
                                layer.close(index);
                                window.isOpen = 0
                            },
                            cancel: function (index) {
                                layer.close(index);
                                window.isOpen = 0
                            }
                        })
                    })
                } else {
                    layerMsg('选择一个调查后才能添加题目');
                    return false;
                }
            })
        },
        addQuestionSubmit: function (index) {
            var url = $('#edit-form').attr('action');
            var params = {
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
                    params.xpath.push(kv);
                }
            })
            $('#answer-item').find('.input-group').each(function (i, v) {
                var answer = $(this).find('input[name=answer]').val();
                if (answer != '') {
                    params.answer.push(answer);
                }
            })
            $.post(url, params, function (ret) {
                if (ret.status == 1) {
                    layer.msg(ret.msg, {icon: 6}, function () {
                        window.isOpen = 0;
                        layer.close(index);
                    });
                    return true;
                } else {
                    layer.msg(ret.msg, {icon: 5});
                    return false;
                }
            })
        },

        addInput: function (obj, type) {
            if (1 == type) {
                var input = '<div class="input-group form-group">\n' +
                    '<div class="col-sm-6"><input type="text" name="xpath" class="form-control input-sm" value="" placeholder="xpath"></div>' +
                    '<div class="col-sm-6"><input type="text" name="value" class="form-control input-sm" value="" placeholder="值，下拉和填空需要"></div>' +
                    '<span class="input-group-btn">' +
                    '<button class="btn btn-danger btn-sm remove-input">删除</button>' +
                    '</span>' +
                    '</div>';
            } else {
                var input = '<div class="input-group form-group">\n' +
                    '<input type="text" name="answer" class="form-control input-sm" value="" placeholder="答案">' +
                    '<span class="input-group-btn">' +
                    '<button class="btn btn-danger btn-sm remove-input">删除</button>' +
                    '</span>' +
                    '</div>';
            }
            $(obj).parent('.form-group').before(input);
        },

        removeInput: function (obj) {
            $(obj).parents('.input-group').remove();
        }
    };
})();


var _survey = (function () {
    var _this = this;
    $('body').on('click', '#survey-search-btn', function () {
        var title = $('body').find('#survey-title-input').val();
        if ('' == title) {
            layerMsg('标题不能为空', 0);
            return false;
        }
        var url = $(this).parents('form').attr('action');
        $.post(url, {title: title}, function (ret) {
            if (ret.status == 1) {
                $('body').find('#survey-list').html(ret.data);
            } else {
                layerMsg(ret.msg, 0);
                return false;
            }
        })
    })

    return {
        addSurvey: function () {
            $.get(select_survey, function (ret) {
                window.isOpen = 1;
                layer.open({
                    type: 1,
                    title: '选择调查',
                    area: ['700px', '400px'],
                    btn: ['确定', '取消'],
                    maxmin: true,
                    moveOut: true,
                    content: ret,
                    yes: function (index) {
                        var action = $('#survey-option').find('.nav li.active').data('action');
                        if (action == 'search') {
                            _survey.selectSurvey(index);
                        } else {
                            _survey.addSurveySubmit(index);
                        }
                        window.isOpen = 0;
                    }
                })
            })
        },

        addSurveySubmit: function (index) {
            var url = $('#edit-form').attr('action');
            var params = {};
            var foem = $('#edit-form').serializeArray();
            $.each(foem, function (i, v) {
                params[v.name] = v.value;
            })
            $.post(url, params, function (ret) {
                if (ret.status == 1) {
                    chrome.storage.sync.set({select_survey: ret.data});
                    layerMsg(ret.msg, 1, function () {
                        layer.close(index);
                    });
                    return true;
                } else {
                    layerMsg(ret.msg, 0);
                    return false;
                }
            })
        },

        selectSurvey: function (index) {
            var selected = $('#survey-list').find('input[name=id]:checked');
            if (selected.length == 0) {
                layerMsg('请选择一个调查', 0);
                return false;
            }
            var survey = $(selected).data('survey');
            chrome.storage.sync.set({select_survey: survey});
            layerMsg('select success', 1, function () {
                layer.close(index);
            });
        },
    };
})();

var _autoAnswer = (function () {
    //手动选择
    $('body').on('mouseup', 'p,div,p,span', function () {
        var text = document.getSelection().toString();
        text = _autoAnswer.iGetInnerText(text);
        chrome.storage.sync.get('survey_status', function (data) {
            if (data.survey_status && data.survey_status.select == 1 && window.isOpen == 0 && text != '') {
                window.isOpen = 1;
                window.getSelection().removeAllRanges();
                _autoAnswer.findQuestion(text)
            }
        })
    })
    
    //自动执行
    chrome.storage.sync.get('survey_status', function (data) {
        if (data.survey_status && data.survey_status.auto == 1) {
            chrome.storage.sync.get('select_survey', function (ret) {
                if (!ret.select_survey) {
                    return false;
                }
                var survey = ret.select_survey;
                if (survey.before== '' || survey.after == '')  {
                    return false;
                }
                _autoAnswer.autoSurvey(survey);
            })
        }
    })
    
    return {
        findQuestion: function (title, callback) {
            $.post(find_question, {title: title}, function (ret) {
                if (ret.status == 0) {
                    layerMsg(ret.msg, 0, function () {
                        window.isOpen = 1;
                        _question.addQuestion(title);
                    })
                } else {
                    window.isOpen = 0;
                    layerMsg('题目找到了,正在识别...', 1, function () {
                        var res = _autoAnswer.findAnswer(ret.data);
                        console.log(res);
                        if (res == true && typeof  callback == 'function') {
                            console.log(callback);
                            callback();
                        }
                    }, 1500);
                }
            })
        },
        findAnswer: function (question) {
            console.log(question)
            var ret1 = 1,ret2 = 1,ret3 = 1;
            if (question.script != '') {
                ret1 = _autoAnswer.autoScript(question.script)
            }
            if (question.xpath.length > 0) {
                ret2 = _autoAnswer.autoXpath(question.xpath);
            }
            if (question.answer.length > 0) {
                ret3 = _autoAnswer.auroAnswer(question.answer);
            }
            if (0 == ret1 || 0 == ret2 || 0 == ret3) {
                return false;
            }
            return true;
        },
        ///寻找答案
        auroAnswer: function (answer) {
            var flag = 1;
            $.each(answer, function (i, v) {
                var dom = $(':contains("' + v + '")');
                if (dom.length == 0) {
                    flag = 0;
                }
                for (i = dom.length; i >= 0; i--) {
                    var tagName = $(dom[i - 1]).prop('tagName');
                    flag = 0;
                    switch (tagName) {
                        case 'OPTION':
                            if ($(dom[i - 1]).is(':selected')) {
                                return true;
                            }
                            $(dom[i - 1]).attr('selected', true);
                            break;
                        default:
                            var input = $(dom[i - 1]).find('input');
                            if (input.length > 0) {
                                _autoAnswer.input(input, '');
                            }
                            break;
                    }
                    $(dom[i - 1]).css('border', '1px solid red');
                }
            })

            return flag;
        },
        //执行xpath处理
        autoXpath: function (xpath) {
            var flag = 1;
            $.each(xpath, function (i, v) {
                var dom = _autoAnswer.xpath(v[0]);
                if (dom.length == 0) {
                    flag = 0;
                    return true;
                }
                var tagName = $(dom).prop('tagName');
                console.log(dom)
                switch (tagName) {
                    case 'OPTION':
                        if ($(dom).is(':selected')) {
                            return true;
                        }
                        $(dom).attr('selected', true);
                        break;
                    case 'INPUT':
                        _autoAnswer.input(dom, v[1]);
                        break;
                    default:
                        $(dom).click();
                        break;
                }
                $(dom).css('border', '1px solid red');
            })
            return flag;
        },
        //执行javascript
        autoScript: function (script) {
            eval(script);
            layerMsg('js执行成功', 1);
            return 1;
        },
        //通过xpath找到指定dom
        xpath: function (STR_XPATH) {
            var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
            var xnodes = [];
            var xres;
            while (xres = xresult.iterateNext()) {
                xnodes.push(xres);
            }
            return xnodes;
        },
        //识别input
        input: function (dom, value) {
            var flag = 0;
            var type = $(dom).attr('type');
            switch (type) {
                case 'checkbox':
                    if (!$(dom).is(':checked')) {
                        $(dom).attr('checked', true);
                        $(dom).click();
                        flag = 1;
                    }
                    break;
                case 'radio':
                    if (!$(dom).is(':checked')) {
                        $(dom).attr('checked', true);
                        $(dom).click();
                        flag = 1;
                    }
                    break;
                case 'text':
                    if (!$(dom).val() != '') {
                        $(dom).val(value);
                        flag = 1;
                    }
                    break;
                case 'password':
                    if (!$(dom).val() != '' && value != '') {
                        $(dom).val(value);
                        flag = 1;
                    }
                    break;
                default:
                    layerMsg('未找到', 0);
                    break;
            }
            if (flag == 1) {
                return true;
            } else {
                return false;
            }
        },

        autoSurvey: function(survey) {
            var title = '';
            eval(survey.before);
            if (title == '') {
                return false;
            }
            _autoAnswer.findQuestion(title, function () {
                setTimeout(function () {
                    eval(survey.after);
                }, 1000);
            });
        },
        //remove space \n
        iGetInnerText: function (testStr) {
            var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
            resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
            resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
            return resultStr;
        }
    };
})()

$(document).ready(function () {


    $(document).keyup(function (event) {
        switch (event.keyCode) {
            case 27:
                layer.closeAll();
                window.isOpen = 0;
        }
    });

});

//alert message
function layerMsg(msg, type, callback, time) {
    time = time ? time : 300
    if (1 == type) {
        layer.msg(msg, {icon: 6, shade: 0.2, time: time}, function () {
            if (typeof callback == 'function')
                callback();
        })
    } else {
        layer.msg(msg, {icon: 5, shade: 0.2, time: 1500}, function () {
            if (typeof callback == 'function')
                callback();
        })
    }
}
