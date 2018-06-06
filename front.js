window.isOpen = 0;
$(document).ready(function() {
	$('body').on('mouseup', 'p,div,p,span', function() {
		var text = document.getSelection().toString();
		text = iGetInnerText(text);
		if (window.isOpen == 0 && text != '') {
			window.isOpen = 1;
			window.getSelection().removeAllRanges();
			$.post('https://survey.yhdjy.cn/survey/add', {title: text}, function(ret) {
				layer.open({
				  type: 1,
				  area: ['700px', '400px'], //宽高
				  content: ret,
				  cancel: function(index) {
				  	window.isOpen = 0;
				  }
				});
			})
		}
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
        var title = $('body').find('#survey-title').val();
        var answer = $('body').find('#survey-answer').val();
        var option = $('body').find('#survey-option').val();
        if (title == '') {
            layer.msg('题干不能为空', {icon:6});
            return false;
        }
        if (answer == '') {
            layer.msg('答案不能为空', {icon:5});
            return false;
        }
        $.post("http://survey.yhdjy.cn/survey/save", {
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


});


function iGetInnerText(testStr) {
    var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
    resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
    resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return resultStr;
}
