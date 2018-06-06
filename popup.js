// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$('#auto').change(function() {
    var auto = 'off';
    if ($(this).is(':checked')) {
        auto = 'on';
    }
    chrome.storage.sync.set({survey_option: auto});
})

$('#save-survey').click(function() {
    var title = $('#survey-title').val();
    if(title == '') {
        layer.msg('调查标题不能为空', {icon:5});
        return false;
    }
    $.post('https://survey.yhdjy.cn/survey/add', {title: title}, function(ret) {
        if(ret.status == 1) {
            chrome.storage.sync.set({survey: {id:ret.id, title: title}});
            layer.msg('保存成功', {icon:6});
        } else {
            layer.msg(ret.msg, {icon:5});
        }
    })
})

chrome.storage.sync.get('survey_option', function(data) {
    if (data.survey_option == 'on') {
        $('#auto').attr('checked', true);
    } else {
        $('#auto').attr('checked', false);
        $('#survey-title').val()
    }
});

chrome.storage.sync.get('survey', function(data) {
    if (data.survey) {
        $('#survey-title').val(data.survey.title)
    }
});

