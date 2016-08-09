// index页面的脚本

var gameCode = '';// 用户输入的比赛代码

// 进入比赛统计页面 #gameon按钮被按下
function getReadyGame(){
	initGameCodePopoverHTML();
	
//	mui.prompt(msg, placeholder, title, btnArray, function(e) {
//		var isIn = false;
//		if (e.index == -1) { // 按错了
//			return;
//		} else {
//			if (e.index == 0) {
//				// 先拿到输入的代码
//				console.log("value:"+e.value);
//				myStorageHandler_setItem("lastGameCode", e.value);// 先保存起来
//				// 给它一个等待
//				// 给它一个结果
//			} else if (e.index == 1) {
//				// 直接去设置页面
//				mui.openWindow("gamesettings.html", "gamesettings");
//			}
//		}
//	});
	
	
}

// 初始化弹出菜单，提供选择队员
function initGameCodePopoverHTML() {
	var lastGameCode = myStorageHandler_getItem("lastGameCode");
	if(lastGameCode != ''){
		$("#gameCodeInPopover").val(lastGameCode);	
	}
	mui('.mui-popover').popover('toggle', document.getElementById("hoverOfGameCodePopover"));
}

// 弹出菜单选择球员结束后
function afterGameCodePopover() {
	mui('.mui-popover').popover('toggle', document.getElementById("hoverOfGameCodePopover"));
}

// 根据选择，是否去读取网络远端内容
function isCheckGameCode(val){
	if(val){
		gameCode = $("#gameCodeInPopover").val();
		afterGameCodePopover();
		checkGameCode();
	}else{
		myStorageHandler_setItem("hasGameCode",false);
		afterGameCodePopover();
		// 直接去设置页面
		mui.openWindow("gamesettings.html", "gamesettings");
	}
	
}
// 真正地去读取网络远端内容
function checkGameCode(){
	myStorageHandler_setItem("lastGameCode", gameCode);// 先保存起来
	// 给它一个等待
	var w = plus.nativeUI.showWaiting( "正在验证，请等待..." );
	// 给它一个结果
	
}


function closeWaiting(){
 	plus.nativeUI.closeWaiting();
}
