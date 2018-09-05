layer.config({
    shade: false
});
window.isOpen = 0;
window.callFunction = 'callTop';
var times = null;
var autoAnswerFlag = 0;
var clickDomType = 'getDom';

var _question = (function () {
    //鉴定点击元素，并取得xpath和text
    $('*').on('click', function (e) {
        if (helper.isOpenSelector()) {
            e.stopPropagation();//停止冒泡
            //取xpath
            var params = {
                xpath: helper.getDomXpath(this),
                text: helper.iGetInnerText($(this).text()),
            };
            //关闭坐标
            helper.closeSelector();
            //把数据传回iframe
            switch (clickDomType) {
                case 'getDom':
                    helper.callIframe('_iquestion.writeClickResult', params);
                    break;
                case 'getAllAnswer':
                    _question.getAllAnswer(params);
                    break;
            }
            return false;
        } else {
            return true;
        }
    });
    return {
        //添加题目弹框
        addQuestion: function (title) {
            helper.getStorage('select_survey', function (data) {
                if (data) {
                    if (!title) {
                        title = _autoAnswer.getTitle(data);
                    }
                    var url = add_question + '/' + data.id + '?title=' + (title ? title : '');
                    layer.open({
                        type: 2,
                        title: '添加题目',
                        area: ['700px', '440px'],
                        btn: ['确定', '测试', '取消'],
                        maxmin: true,
                        moveOut: true,
                        content: url,
                        btn1: function (index) {
                            //保存题目
                            helper.callIframe('_iquestion.addQuestionSubmit');
                        },
                        btn2: function (index) {
                            //测试题目
                            helper.callIframe('_iquestion.addQuestionSubmit', {
                                returnParams: true,
                            });
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
                    helper.layerMsg('选择一个调查后才能添加题目');
                    return false;
                }
            })
        },
        //全选
        getAllAnswer: function(params) {
            var dom = helper.parseXpath(params.xpath);
            var checkbox = $(dom).find('input[type=checkbox]');
            if (checkbox.length > 0) {
                var name = checkbox.eq(0).attr('name');
                $('body').find('.select-num-flag').remove();
                var allAnswer = $('body').find('input[name="'+name+'"]');
                var allAnswerXpath = [];
                $(allAnswer).each(function (i, v) {
                    $(v).parent().prepend('<font class="select-num-flag" color="red">'+(i+1)+'</font>');
                    allAnswerXpath.push(helper.getDomXpath(v));
                })
                helper.callIframe('_iquestion.writeClickRandom', {answers: allAnswerXpath});
            }
        },

        /**
         * 获取点击元素
         * @param params
         */
        getClickDom: function (params) {
            clickDomType = params.type ? params.type : 'getDom';
            helper.openSelector();
        }
    };
})();


var _survey = (function () {
    //esc关闭弹框
    $(document).keyup(function (event) {
        switch (event.keyCode) {
            case 27:
                layer.closeAll();
                window.isOpen = 0;
        }
    })

    return {
        //添加/选择调查弹框
        addSurvey: function () {
            window.isOpen = 1;
            layer.open({
                type: 2,
                title: '选择调查',
                area: ['700px', '400px'],
                btn: ['确定', '测试','取消'],
                maxmin: true,
                moveOut: true,
                content: select_survey,
                btn1: function () {
                    helper.callIframe('_isurvey.save');
                    window.isOpen = 0;
                    return false;
                },
                btn2:function () {
                    helper.callIframe('_isurvey.save', 1);
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
        },
        /**
         * 测试调查
         * @param survey
         * @returns {boolean}
         */
        testSurvey: function (survey) {
            if (helper.isEmpty(survey)) return false;
            helper.layerMsg(_autoAnswer.getTitle(survey));
            if (survey.next != '') {
                $(survey.next).css('border', '2px solid red');
            }
            return false;
        }
    };
})();

var _autoAnswer = (function () {
    //手动选择
    $('body').on('mouseup', 'p,div,p,span', function () {
        var text = document.getSelection().toString();
        text = helper.iGetInnerText(text);
        helper.getStorage('survey_status', function (data) {
            if (data && data.select == 1 && window.isOpen == 0 && text != '') {
                window.isOpen = 1;
                window.getSelection().removeAllRanges();
                _autoAnswer.findQuestion(text)
            }
        })
    })

    //舰艇开启自动执行
    $(function () {
        times = setInterval(function () {
            helper.getStorage('survey_status', function (data) {
                if (data && data.auto == 1) {
                    helper.getStorage('select_survey', function (survey) {
                        if (!survey) {
                            return false;
                        }
                        _autoAnswer.autoSurvey(survey);
                    })
                }
            })
        }, 1000);
    })
    return {
        start: function () {
            if (autoAnswerFlag == 1 || window.isOpen == 1) {
                return false;
            }
            helper.getStorage('select_survey', function (survey) {
                if (!survey) {
                    return false;
                }
                if (helper.isEmpty(survey)) return false;
                _autoAnswer.autoSurvey(survey);
            })
        },
        //自动识别入口
        autoSurvey: function (survey) {
            var title = _autoAnswer.getTitle(survey);
            if (title == '') {
                _autoAnswer.getNext(survey);
                return false;
            }
            clearInterval(times);
            autoAnswerFlag == 1;
            _autoAnswer.findQuestion(title, function () {
                setTimeout(function () {
                    _autoAnswer.getNext(survey);
                    autoAnswerFlag == 0;
                }, 1000);
            });
        },
        //获取题目标题，根据调查里的配置
        getTitle: function (survey) {
            var title = '';
            if (survey.before != '') {
                eval(survey.before);
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
            }
            title = helper.iGetInnerText(title);
            return title;
        },
        //找题目
        findQuestion: function (title, callback) {
            //远程请求题目
            $.post(find_question, {title: title}, function (ret) {
                //题目不存在提示添加
                if (ret.status == 0) {
                    helper.layerMsg(ret.msg, 0, function () {
                        window.isOpen = 1;
                        _question.addQuestion(title);
                    })
                } else {
                    //题目存在 执行自动作答
                    window.isOpen = 0;
                    helper.layerMsg('题目找到了,开始作答...', 1, function () {
                        var res = _autoAnswer.findAnswer(ret.data);
                        if (res == true && typeof  callback == 'function') {
                            callback();
                        }
                    }, 500);
                }
            })
        },
        //找答案入口
        findAnswer: function (question) {
            var ret1 = 1, ret2 = 1, ret3 = 1,ret4 = 1;
            if (question.script != '') {
                ret1 = _autoAnswer.autoScript(question.script)
            }
            if (question.xpath.length > 0) {
                ret2 = _autoAnswer.autoXpath(question.xpath);
            }
            if (question.answer.length > 0) {
                ret3 = _autoAnswer.autoAnswer(question.answer);
            }
            if (question.random && question.random.type)  {
                switch(question.random.type) {
                    case 'random':
                        ret4 = _question.getRandom(question.random);
                        break;
                    case 'randoms':
                        ret4 = _question.getRandoms(question.random);
                        break;
                    case 'all':
                        ret4 = _question.getAll(question.random);
                        break;
                    default:
                        ret4 = 0;
                        break;
                }
            }
            if (0 == ret1 || 0 == ret2 || 0 == ret3 || 0 == ret4) {
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
                var dom = helper.parseXpath(v[0]);
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
            return 1;
        },
        //对答案不同类型的dom做处理
        dom: function (dom, value) {
            var tagName = $(dom).prop('tagName');
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
                case 'SELECT':
                    $(dom).val(value)
                    break;
                case 'TEXTAREA':
                    $(dom).val(value)
                    break;
                default:
                    if ($(dom).find('input[type=checkbox]:checked').length == 0) {
                        $(dom).click();
                    }
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
                        flag = 1;
                    }
                    break;
                case 'radio':
                    if (!$(dom).is(':checked')) {
                        $(dom).click()
                        flag = 1;
                    }
                    break;
                default:
                    if (!$(dom).val() != '') {
                        $(dom).val(value);
                        flag = 1;
                    }
                    break;
            }
            if (flag == 1) {
                return true;
            } else {
                return false;
            }
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
        }
    };
})();