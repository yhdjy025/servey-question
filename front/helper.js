//为兼容firefox和chrome
if (typeof chrome == 'undefined') {
    var chrome = browser;
}

/**
 * 助手类
 */
class Helper {
    /**
     * 去掉自负床的空格换行等
     * @param testStr
     * @returns {*}
     */
    iGetInnerText(testStr) {
        var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
        resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
        resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
        return resultStr;
    }

    /**
     * 打开选择坐标
     */
    openSelector() {
        window.isOpenSelector = 1;
        var px_line = '<p id="px_line" style="width:100%;top: 0;z-index:999999;left: 0;height:1px;position:fixed;background:red;"></p>';
        var py_line = '<p id="py_line" style="height:100%;top: 0;z-index:999999;left: 0;width:1px;position:fixed;background:red;"></p>';
        $('body').append(px_line)
        $('body').append(py_line);
        $(document).on('mousemove', function (e) {
            var e = e || event;
            var x = e.clientX;
            var y = e.clientY;
            $('#px_line').css('top', (y + 2) + 'px');
            $('#py_line').css('left', (x - 2) + 'px');
        });
    }

    /**
     * 关闭选择坐标
     */
    closeSelector() {
        window.isOpenSelector = 0;
        $('body').find('#px_line').remove();
        $('body').find('#py_line').remove();
    }

    /**
     * 获取元素的xpath
     * @param element       要获取元素dom，不是jquerydom
     * @returns {string}    返回xpath
     */
    getDomXpath(element) {
        if (element.id !== "") {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
            return '//*[@id=\"' + element.id + '\"]';
        }
        //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
        if (element == document.body) {//递归到body处，结束递归
            return '/html/' + element.tagName.toLowerCase();
        }
        var ix = 1,//在nodelist中的位置，且每次点击初始化
            siblings = element.parentNode.childNodes;//同级的子元素

        for (var i = 0, l = siblings.length; i < l; i++) {
            var sibling = siblings[i];
            //如果这个元素是siblings数组中的元素，则执行递归操作
            if (sibling == element) {
                return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
                //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
            } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
                ix++;
            }
        }
    }

    /**
     * 通过xpath找到指定元素
     * @returns {Array}
     */
    pardeXpath() {
        var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
        var xnodes = [];
        var xres;
        while (xres = xresult.iterateNext()) {
            xnodes.push(xres);
        }
        return xnodes;
    }

    /**
     * 调用指定window的方法
     * @param toWindow
     * @param method
     * @param params
     * @param domain
     */
    callTop(toWindow, method, params = {}, domain = '*') {
        this.postMessage(toWindow, 'callTop', {method :method, params: params});
    }

    callIframe(toWindow, method, params = {}, domain = '*') {
        this.postMessage(toWindow, 'callIframe', {method :method, params: params});
    }

    /**
     * 监听消息调用，如果调用的函数有指定的返回值，还会回调回去
     */
    onCall() {
        var _this = this;
        window.addEventListener('message', function (ev) {
            console.log(ev)
            if (ev.data.key == 'callTop' || ev.data.key == 'callIframe') {
                var method = ev.data.data.method.split('.');
                var fun = window;
                for (var i=0; i<method.length; i++) {
                    fun = fun[method[i]];
                }
                if (typeof fun == 'function') {
                    var result = fun(ev.data.data.params);
                    if (result) {
                        if (result.key) {
                            _this.postMessage(ev.source, result.key, result.data);
                        }
                        if (result.method)  {
                            if (ev.data.key == 'callTop')
                                _this.callIframe(ev.source, result.method, result.params);
                            if (ev.data.key == 'callIframe')
                                _this.callIframe(ev.source, result.method, result.params);
                        }
                    }
                }
            }
        });
    }

    /**
     * 向指定window发送消息
     * @param toWindow
     * @param key
     * @param data
     * @param domain
     */
    postMessage(toWindow, key, data = {}, domain = '*') {
        toWindow.postMessage({key: key, data: data}, domain);
    }

    /**
     * 获取当前窗口下的第一个iframe弹窗
     * @returns {Window}
     */
    getiframeWindow() {
        var iframe = $('iframe');
        return iframe[0].contentWindow;
    }

    /**
     * 存储
     * @param key   键
     * @param fata  值
     */
    setStorage(key, fata) {
        chrome.storage.local.set({key: fata});
    }

    /**
     * 取存储
     * @param key       键
     * @param callback  回调  因为是异步取的 只能回调
     */
    getStorage(key, callback) {
        chrome.storage.local.get(key, function (data) {
            if (data[key]) {
                if (typeof callback == 'function')
                    callback(data[key]);
            }
        });
    }
}