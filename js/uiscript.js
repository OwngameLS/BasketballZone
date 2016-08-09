// UI控制的脚本

function openWindow(urlStr, idStr) {
	mui.openWindow({
		url: urlStr,
		id: idStr
	});
}

// 为UI控件实现提示闪烁的方法
function myAnimate(animateEl, animateCount, info, defaultStyle) {
	if(defaultStyle == undefined){
		defaultStyle = '';
	}
	if (info != null) {
		mui.toast(info);
	}
	if (animateCount % 2 == 0) {
		animateEl.attr("style", "background:#F55");
	} else {
		animateEl.attr("style", defaultStyle);
	}
	animateCount--;
	if (animateCount != 0) {
		setTimeout(_myAnimate(animateEl, animateCount, defaultStyle), 400);
	}
}

// 为方便传参所用的方法
function _myAnimate(el, count,dfs) {
	return function() {
		myAnimate(el, count, null, dfs);
	}
}

// 对input UI 进行警示的方法
// 参数：el input id;warningInfos 警告消息
function myInputWarning(el, warningInfos) {
	el.attr("style", "background:#F55");
	mui.toast(warningInfos);
}

// 取消某个Input的警示颜色
function cancleWarning(el) {
	el.attr("style", "background:#FFF");
}

// 更换进攻方向的箭头指向
function changeArrowDirection() {
	var current = String($("#offensiveDirection").attr("src"));
	if (current.indexOf("arrow_l") > 0) {
		$("#offensiveDirection").attr("src", "img/arrow_r.png");
	}
	if (current.indexOf("arrow_r") > 0) {
		$("#offensiveDirection").attr("src", "img/arrow_l.png");
	}
}

function showInfoToast(info) {
	mui.toast(info);
}
