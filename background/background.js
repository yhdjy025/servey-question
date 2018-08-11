// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


/*
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ color: '#3aa757' }, function() {
        console.log('The color is green.');
    });
});*/

/*
var interval1
setInterval(function () {
    helper.getStorage('survey_status', function (data) {
        if (data.auto && data.auto == 1) {
            if (interval1 == null) {    //如果未启动
                start();
            }
        } else if (interval1 != null) {
            clearInterval(interval1);
            console.log('------stop----------')
            interval1 = null;           //清空定时器
        }
    });
}, 1000);

function start() {
    console.log('----------start--------');
    interval1 = setInterval(function () {
        //调用autosurvey
        chrome.tabs.query({active: true}, function (tab) {
            if (tab[0].url.indexOf('http') != -1) {
                chrome.tabs.executeScript(tab.id, {
                    code: '_autoAnswer.start()'
                }, function () {
                    console.log('done');
                })
            }
        })
    }, 5000);
}*/
