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