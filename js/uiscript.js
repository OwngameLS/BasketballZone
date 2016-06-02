// UI控制的脚本

function openWindow(urlStr, idStr) {
	mui.openWindow({
		url: urlStr,
		id: idStr
	});
}


// 为UI控件实现提示闪烁的方法
function myAnimate(animateEl, animateCount) {
	if (animateCount % 2 == 0) {
		animateEl.attr("style", "background:#F55");
	} else {
		animateEl.attr("style", "background:#FFF");
	}
	animateCount--;
	if (animateCount != 0) {
		setTimeout(_myAnimate(animateEl, animateCount), 400);
	}
}
// 为方便传参所用的方法
function _myAnimate(el,count){
	return function(){
		myAnimate(el,count);
	}
}

// 对input UI 进行警示的方法
// 参数：el input id;warningInfos 警告消息
function myInputWarning(el,warningInfos){
	el.attr("style","background:#F55");
	mui.toast(warningInfos);
}

// 取消某个Input的警示颜色
function cancleWarning(el){
	el.attr("style","background:#FFF");
}
