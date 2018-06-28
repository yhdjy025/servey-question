// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
if (typeof chrome == 'undefined') {
    var chrome = browser;
}

chrome.storage.local.get('survey_status', function (data) {
    if (data.survey_status) {
        if (data.survey_status.select == 1) {
            $('#select-find').attr('checked', true);
        }
        if (data.survey_status.auto == 1) {
            $('#auto-find').attr('checked', true);
        }
    }
});

chrome.storage.local.get('select_survey', function (data) {
    if (data.select_survey) {
        var link = '<a href="https://survey.yhdjy.cn/admin/question/'+data.select_survey.id+'" target="_blank">'+data.select_survey.title+'</a>'
        $('#survey-title').html(link);
    }
});

$(function () {
    $('#select-survey').click(function () {
        chrome.tabs.query({active: true}, function (tab) {
            console.log(tab)
            chrome.tabs.executeScript(tab.id, {
                code: '_survey.addSurvey()'
            }, function () {
                console.log('done');
            })
        })
    })

    $('#add-question').click(function () {
        chrome.tabs.query({active: true}, function (tab) {
            chrome.tabs.executeScript(tab.id, {
                code: '_question.addQuestion()'
            }, function () {
                console.log('done');
            })
        })
    })

    
    $('#select-find,#auto-find').change(function () {
        var status = {
            select: $('#select-find').is(':checked') ? 1 : 0,
            auto: $('#auto-find').is(':checked') ? 1 : 0,
        };
        chrome.storage.local.set({survey_status: status});
    })
})

