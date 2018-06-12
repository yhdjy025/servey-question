var select_survey = 'https://survey.yhdjy.cn/chrome/selectSurvey';
var add_question = 'https://survey.yhdjy.cn/chrome/addQuestion';
var add_survey = 'https://survey.yhdjy.cn/chrome/addSurvey';

window.isOpen = 0;
$(document).ready(function() {
	$('body').on('mouseup', 'p,div,p,span', function() {
		var text = document.getSelection().toString();
		text = iGetInnerText(text);
        chrome.storage.sync.get('survey_option', function(data) {
            if (data.survey_option == 'on' && window.isOpen == 0 && text != '') {
                window.isOpen = 1;
                window.getSelection().removeAllRanges();
                $.post('https://survey.yhdjy.cn/survey/addQuestion', {title: text}, function(ret) {
                    if (ret.status == 1) {
                        if (ret.type == 'add') {
                            layer.open({
                                type: 1,
                                area: ['700px', '400px'], //宽高
                                shade: false,
                                content: ret.data,
                                moveOut: true,
                                maxmin: true,
                                cancel: function (index) {
                                    window.isOpen = 0;
                                }
                            });
                        } else {
                            $.each(ret.data.answer, function (i, v) {
                                var dom = $(':contains("'+v+'")');
                                for (i = dom.length; i >= 0; i --) {
                                    var tagName = $(dom[i-1]).prop('tagName');
                                    var flag = 0;
                                    console.log(tagName)
                                    switch (tagName) {
                                        case 'OPTION':
                                            $(dom[i-1]).attr('selected', true);
                                            flag = 1;
                                            break;
                                        default:
                                            var input = $(dom[i-1]).find('input');
                                            if (input.length > 0) {
                                                var type = $(input).attr('type');
                                                switch (type) {
                                                    case 'checkbox':
                                                        $(input).attr('checked', true);
                                                        $(input).click();
                                                        flag = 1;
                                                        break;
                                                    case 'radio':
                                                        $(input).attr('checked', true);
                                                        $(input).click();
                                                        flag = 1;
                                                        break;
                                                    case 'text':
                                                        $(input).val(v);
                                                        flag = 1;
                                                        break;
                                                    default:
                                                        layer.msg('未找到', {icon:5});
                                                        return true;
                                                        break;
                                                }
                                            }
                                            break;
                                    }
                                    if (flag == 1) {
                                        layer.msg('识别成功', {icon:6});
                                        $(dom[i]).css('border', '1px solid green');
                                        return false;
                                    }
                                }
                            })
                            window.isOpen = 0;
                        }
                    } else {
                        layer.msg(ret.msg, {icon:5})
                    }
                })
            }
        });
	})

    $(document).keyup(function(event) {
        switch (event.keyCode) {
            case 27:
                layer.closeAll();
                window.isOpen = 0;
            case 96:
                layer.closeAll();
                window.isOpen = 0;
        }
    });

	$('body').on('click', '#add-survey-btn', function() {
        chrome.storage.sync.get('survey', function(data) {
            var title = $('body').find('#survey-title').val();
            var answer = [];
            $('.survey-answer').each(function (i, v) {
                var text = $(v).val();
                if (text != '') {
                    answer.push(text);
                }
            })
            var option = $('body').find('#survey-option').val();
            if (title == '') {
                layer.msg('题干不能为空', {icon:6});
                return false;
            }
            if (answer.length == 0) {
                layer.msg('答案不能为空', {icon:5});
                return false;
            }
            $.post("https://survey.yhdjy.cn/survey/save", {
                sid: data.survey.id,
                title: title,
                answer: answer,
                option: option
            }, function(ret) {
                if (ret.status == 1) {
                    layer.msg('添加成功', {icon:6}, function() {
                        window.isOpen = 0;
                        layer.closeAll();
                    });
                } else {
                    layer.msg(ret.msg, {icon:5});
                    return false;
                }
            });
            return false;
        })
    })

    $('body').on('click', '#add-answer-item', function() {
        var html = '  <div class="form-item-s">\n' +
            '            <label for="">答案：</label>\n' +
            '            <input class="survey-answer" name="answer[]" type="text">\n' +
            '<button class="remove-btn">删除</button>' +
            '        </div>';
        $('.extra-answer').append(html);
    })
    $('body').on('click', '.remove-btn', function () {
        $(this).parents('.form-item-s').remove();
    })

    $('body').on('click', '#survey-search-btn', function () {
        var title = $('body').find('#survey-title-input').val();
        if ('' == title) {
            layer.msg('title is not allowed empty', {icon:5});
            return false;
        }
        var url = $(this).parents('form').attr('action');
    })
});


function iGetInnerText(testStr) {
    var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
    resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
    resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return resultStr;
}

// add survey
function addQuestion() {
    $.get(select_survey, function (ret) {
        layer.open({
            type: 1,
            area: ['700px', '400px'],
            btn:['确定', '取消'],
            content: ret,
            yes: function (index) {
                addSurveySubmit(index);
            }
        })
    })
}

// save survey
function addSurveySubmit(index) {
    var url = $('#edit-form').attr('action');
    var params = {};
    var foem = $('#edit-form').serializeArray();
    $.each(foem, function (i, v) {
        params[v.name] = v.value;
    })
    $.post(url, params, function (ret) {
        if (ret.status == 1) {
            chrome.storage.sync.set({select_survey: ret.data});
            layer.msg(ret.msg, {icon:6}, function () {
                layer.close(index);
            });
            return true;
        }  else {
            layer.msg(ret.msg, {icon:5});
            return false;
        }
    })
}

