var select_survey = 'https://survey.yhdjy.cn/chrome/selectSurvey';
var find_question = 'https://survey.yhdjy.cn/chrome/findQuestion';
var add_question = 'https://survey.yhdjy.cn/chrome/addQuestion';
var times = null;
layer.config({
    shade: false
});
window.isOpen = 0;

var _question = (function () {
    $('body').on('click', '#edit-form .add-input', function () {
        var type = $(this).data('type');
        _question.addInput(this, type);
    })

    $('body').on('click', '#edit-form .remove-input', function () {
        _question.removeInput(this);
    })

    return {
        //添加题目弹框
        addQuestion: function (title) {
            chrome.storage.sync.get('select_survey', function (data) {
                if (data.select_survey) {
                    if (!title) {
                        title = _autoAnswer.getTitle(data.select_survey);
                        console.log(title)
                    }
                    var url = add_question + '/' + data.select_survey.id + '?title=' + (title ? title : '');
                    layer.open({
                        type: 2,
                        title: '添加题目',
                        area: ['700px', '400px'],
                        btn: ['确定', '测试', '取消'],
                        maxmin: true,
                        moveOut: true,
                        content: url,
                        btn1: function (index) {
                            var iframe = $('iframe');
                            iframe[0].contentWindow.postMessage({key: 'save_question_cmd'}, '*');
                            window.addEventListener('message', function (ev) {
                                if (ev.data.key == 'save_question') {
                                    layer.close(index);
                                    window.isOpen = 0;
                                }
                            }, false)
                        },
                        btn2: function (index) {
                            var iframe = $('iframe');
                            iframe[0].contentWindow.postMessage({key: 'get_auto_question'}, '*');
                            return false;
                        },
                        btn3: function (index) {
                            layer.close(index);
                            window.isOpen = 0
                        },
                        cancel: function (index) {
                            layer.close(index);
                            window.isOpen = 0
                        }
                    })
                } else {
                    layerMsg('选择一个调查后才能添加题目');
                    return false;
                }
            })
        },
        //添加题目提交
        addQuestionSubmit: function (returnParams) {
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
            if (returnParams == true) {
                return params;
            }
            $.post(url, params, function (ret) {
                if (ret.status == 1) {
                    layer.msg(ret.msg, {icon: 6}, function () {
                        window.parent.postMessage({key: 'save_question'}, '*');
                    });
                    return true;
                } else {
                    layer.msg(ret.msg, {icon: 5});
                    return false;
                }
            })
        },
        //添加一个答案
        addInput: function (obj, type) {
            if (1 == type) {
                var input = '<div class="input-group form-group">\n' +
                    '<div class="col-xs-6"><input type="text" name="xpath" class="form-control input-sm" value="" placeholder="xpath"></div>' +
                    '<div class="col-xs-6"><input type="text" name="value" class="form-control input-sm" value="" placeholder="值，下拉和填空需要"></div>' +
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
        //删除答案
        removeInput: function (obj) {
            $(obj).parents('.input-group').remove();
        }
    };
})();


var _survey = (function () {
    //搜索调查
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
    //选择调查操作
    $('body').on('click', '#search-action tbody tr', function () {
        $('#search-action tbody tr').removeClass('bg-primary');
        $(this).addClass('bg-primary');
        $(this).find('input').attr('checked');
    })

    return {
        //添加/选择调查弹框
        addSurvey: function () {
            window.isOpen = 1;
            layer.open({
                type: 2,
                title: '选择调查',
                area: ['700px', '400px'],
                btn: ['确定', '取消'],
                maxmin: true,
                moveOut: true,
                content: select_survey,
                yes: function (index) {
                    var iframe = $('iframe');
                    iframe[0].contentWindow.postMessage({key: 'save_survey_cmd'}, '*')
                    window.addEventListener('message', function (ev) {
                        if (ev.data.key == 'save_survey') {
                            layer.close(index);
                        }
                    }, false)
                    window.isOpen = 0;
                    return false;
                }
            })
        },
        //调查添加选择入口
        save: function () {
            var action = $('#survey-option').find('.nav li.active').data('action');
            if (action == 'search') {
                _survey.selectSurvey();
            } else {
                _survey.addSurveySubmit();
            }
        },
        //添加调查提交
        addSurveySubmit: function () {
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
                        window.parent.postMessage({key: 'save_survey'}, '*');
                    });
                    return true;
                } else {
                    layerMsg(ret.msg, 0);
                    return false;
                }
            })
        },
        //选择调查
        selectSurvey: function () {
            var selected = $('#survey-list').find('tr.bg-primary');
            if (selected.length == 0) {
                layerMsg('请选择一个调查', 0);
                return false;
            }
            var survey = $(selected).data('survey');
            console.log(survey)
            chrome.storage.sync.set({select_survey: survey});
            layerMsg('select success', 1, function () {
                window.parent.postMessage({key: 'save_survey'}, '*');
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

    //舰艇开启自动执行
    $(function () {
        times = setInterval(function () {
            chrome.storage.sync.get('survey_status', function (data) {
                if (data.survey_status && data.survey_status.auto == 1) {
                    chrome.storage.sync.get('select_survey', function (ret) {
                        if (!ret.select_survey) {
                            return false;
                        }
                        var survey = ret.select_survey;
                        _autoAnswer.autoSurvey(survey);
                    })
                }
            })
        }, 1000);
    })

    return {
        //找题目
        findQuestion: function (title, callback) {
            //远程请求题目
            $.post(find_question, {title: title}, function (ret) {
                //题目不存在提示添加
                if (ret.status == 0) {
                    layerMsg(ret.msg, 0, function () {
                        window.isOpen = 1;
                        _question.addQuestion(title);
                    })
                } else {
                    //题目存在 执行自动作答
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
        //找答案入口
        findAnswer: function (question) {
            console.log(question)
            var ret1 = 1, ret2 = 1, ret3 = 1;
            if (question.script != '') {
                ret1 = _autoAnswer.autoScript(question.script)
            }
            if (question.xpath.length > 0) {
                ret2 = _autoAnswer.autoXpath(question.xpath);
            }
            if (question.answer.length > 0) {
                ret3 = _autoAnswer.autoAnswer(question.answer);
            }
            if (0 == ret1 || 0 == ret2 || 0 == ret3) {
                return false;
            }
            return true;
        },
        ///寻找答案
        autoAnswer: function (answer) {
            var flag = 1;
            $.each(answer, function (i, v) {
                var dom = $(':contains("' + v + '")');
                if (dom.length == 0) {
                    flag = 0;
                }
                for (i = dom.length - 1; i >= 0; i--) {
                    var tagName = $(dom[i]).prop('tagName');
                    flag = 0;
                    switch (tagName) {
                        case 'OPTION':
                            if (!$(dom[i]).is(':selected')) {
                                $(dom[i]).attr('selected', true);
                                flag = 1;
                            }
                            break;
                        default:
                            var input = $(dom[i]).find('input');
                            if (input.length > 0) {
                                flag = _autoAnswer.input(input, '');
                            }
                            break;
                    }
                    if (flag == 1) {
                        $(dom[i]).css('border', '1px solid red');
                        break;
                    }
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
                _autoAnswer.dom(dom, v[1]);
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
        //对答案不同类型的dom做处理
        dom: function (dom, value) {
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
                    _autoAnswer.input(dom, value);
                    break;
                default:
                    $(dom).click();
                    break;
            }
            $(dom).css('border', '1px solid red');
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
        //自动识别入口
        autoSurvey: function (survey) {
            var title = _autoAnswer.getTitle(survey);
            if (title == '') {
                return false;
            }
            clearInterval(times);
            _autoAnswer.findQuestion(title, function () {
                setTimeout(function () {
                    _autoAnswer.getNext(survey);
                }, 1000);
            });
        },
        //获取题目标题，根据调查里的配置
        getTitle: function (survey) {
            console.log(survey)
            var title = '';
            if (survey.before != '') {
                eval(survey.before);
                console.log(title)
            }
            if (survey.get_title != '' && title == '') {
                if (survey.get_title.indexOf('@') == 0) {
                    var dom = _autoAnswer.xpath(survey.get_title.substr(1));
                } else {
                    var dom = $(survey.get_title);
                }
                if (dom.length > 0) {
                    title = $(dom).text();
                }
                console.log(title)
            }
            return title;
        },
        //下一题按钮点击
        getNext: function (survey) {
            if (survey.after != '') {
                eval(survey.after);
            } else {
                if (survey.next.indexOf('@') == 0) {
                    var dom = _autoAnswer.xpath(survey.next.substr(1));
                } else {
                    var dom = $(survey.next);
                }
                if (dom.length > 0) {
                    $(dom).click();
                }
            }
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
    //esc关闭弹框
    switch (event.keyCode) {
        case 27:
            layer.closeAll();
            window.isOpen = 0;
    }
});

window.addEventListener('message', function (ev) {
    //保存调查的指令 来自主页面
    if (ev.data.key == 'save_survey_cmd') {
        _survey.save();
    }
    //保存题目的指令 来自主页面
    if (ev.data.key == 'save_question_cmd') {
        _question.addQuestionSubmit();
    }
    //用于测试添加的答案是否可用 来自iframe
    if (ev.data.key == 'test_auto_question') {
        console.log(ev.data);
        _autoAnswer.findAnswer(ev.data.question);
    }
    //获取题目答案数据 来自主页面的通知
    if (ev.data.key == 'get_auto_question') {
        var params = _question.addQuestionSubmit(true);
        //获取到题目数据后 通知主页面测试答案
        window.parent.postMessage({
            key: 'test_auto_question',
            question: params
        }, '*');
    }
}, false)

//弹出提示
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
