// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.storage.sync.get('survey_status', function (data) {
    if (data.survey_status) {
        if (data.survey_status.select == 1) {
            $('#select-find').attr('checked', true);
        }
        if (data.survey_status.auto == 1) {
            $('#auto-find').attr('checked', true);
        }
    }
});

chrome.storage.sync.get('select_survey', function (data) {
    if (data.select_survey) {
        $('#survey-title').text(data.select_survey.title);
    }
});

$(function () {
    $('#select-survey').click(function () {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.executeScript(tab.id, {
                code: 'addQuestion()'
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
        chrome.storage.sync.set({survey_status: status});
    })
})

