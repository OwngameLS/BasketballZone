// 比赛数据统计设置的脚本
// 主要实现将比赛数据统计的设定可视化，同时实现将设定完成的设定数据化保存起来。

// 根据用户初始设定的环境变量
var gameType; // 比赛类型
var isNeed24s = false; // 是否需要记录24秒
var gameCount = "time"; // 比赛结束记录方式，时间或者分数
var totalSections; // 比赛总节数
var currentSection; // 当前节数
var gameCountPerSection; // 每一节结束的满足条件，比分或者时间
var gameCountOvertime; // 加时赛的结束满足条件
var isFreeThrow = true; // 是否需要罚球
var isNeedPersonal = true; // 是否需要记录每个人的数据
var isNeedOvertime = true; // 是否需要加时
var foulOutCount; // 犯规次数
var timeOutCount; // 可用暂停次数
var isNeedRate = true; // 是否需要统计命中率
var playersOnCourt = 5; // 单边在场人数

var playerCountsHome = 0,
	playerCountsGuest = 0,
	playerCountsMax = 0,
	playerCountsLimit = 16;

var teamNameHome, teamNameGuest; // 队伍显示的名字	
var teamCodeHome, teamCodeGuest; // 队伍代码
// 参与计算的变量
var canStartGame = true; // 是否可以开始比赛

var homePlayerInfos = null; // 主队队员信息
var guestPlayerInfos = null; // 客队队员信息

var settingsJsonString = '';
var statOptionString = '';
var gameRulesString = '';
var teamInfosString = '';
var playerInfosString = '';

// 当进入比赛设置页面后，先执行一次设置，从上一次使用的设置中读取
function initStatSettings() {
	var statSettings = null;
	// 是否读取上一次的设置
	if (isNeedLastSettings()) {
		statSettings = loadSettings("lastSettings");
	} else { // 不读取，则先将相关的控件初始化好
		statSettings = loadSettings("defaultSettings");
	}
	// 将读取到的statSettings(jsonObj)传到初始化方法中
	prepareGame(statSettings);

	//	// 检查是否输入了比赛代码
	//	// 如果有设置了比赛代码，则从远端读取比赛设置，只留下可以自定义的设置
	//	// 如果没有，则全部重新读取设置
	//	var a = chkGameNo();
	//
	//	if (a == false) { // 输入了无效的比赛代码
	//		// 询问是否读取最近一次的设置
	//		if(isNeedLastSettings()){
	//			isLoadLastSettings(true);
	//		}
	//	} else {
	//		// 读取远端传来的设置
	//	}

}

function isNeedLastSettings() {
	var isNeed = $("input[name='isLoadLastSettings']:checked").val(); // jquery 对radiobutton选中值的判断 
	if (isNeed == 'yes') {
		return true;
	} else {
		return false;
	}
}

// 检查是否输入了合理的比赛代码
function chkGameNo() {
	var gameNumber = $.trim($("#gameNo").val());
	if (gameNumber == null || gameNumber == "") {
		return false;
	} else {
		return myAjaxBoolean("aaa", gameNumber);
	}
}
// 异步更新 返回成功与否
function myAjaxBoolean(urlStr, dataStr) {
	mui.ajax({
		type: "post",
		dataType: "json",
		url: urlStr,
		data: dataStr,
		complete: function() {
			$("#load").hide();
		},
		success: function(msg) {

		}
	});
}

// 初始化比赛设置的各类控件
// parameter：statSettings 用于初始化控件的json对象
// 用statSettings的各个部分初始化各个控件
function prepareGame(statSettings) {
	if (statSettings != null) { // 读到了配置
		setStatOptions(statSettings.statOptions); // 设置数据统计记录细节
		setGameRules(statSettings.gameRules); // 设置比赛规则
		setTeamInfos(statSettings.teamInfos); // 设置球队信息
		setPlayerInfos(statSettings.playersInfos); // 设置球员信息
	}

	// 需要在这里增加一个验证方法，确定是否全部设置可用，可以立即比赛
	// canStartGame = verifySettings(); // 尚未实现
	if (canStartGame) {
		$("#prepareGame").html("开始比赛");
		$("#prepareGame").attr("class", "mui-btn mui-btn-primary mui-pull-right");
	}

}



// 验证设置的方法
// 当一些配置发生了更改，就要做判断，确保开始比赛前的设置都是符合逻辑的
function verifySettings() {
	console.log("verify settings..." + totalSections);
	if (isInteger(totalSections) == false) {
		cantStartGame();
		myInputWarning($("#totalsections"), "请输入数字");
		return;
	} else {
		cancleWarning($("#totalsections"));
	}
	console.log("11");
	if (isInteger(gameCountPerSection) == false) {
		cantStartGame();
		myInputWarning($("#gamecountpersection"), "请输入数字");
		return;
	} else {
		cancleWarning($("#gamecountpersection"));
	}
	console.log("12");
	if (isInteger(gameCountOvertime) == false) {
		cantStartGame();
		myInputWarning($("#gamecountovertime"), "请输入数字");
		return;
	} else {
		cancleWarning($("#gamecountovertime"));
	}
	console.log("13");
	if (isInteger(playersOnCourt) == false) {
		cantStartGame();
		myInputWarning($("#playersoncourt"), "请输入数字");
		return;
	} else {
		cancleWarning($("#playersoncourt"));
	}
	console.log("14");
	if (isInteger(foulOutCount) == false) {
		cantStartGame();
		myInputWarning($("#foulOutCount"), "请输入数字");
		return;
	} else {
		cancleWarning($("#foulOutCount"));
	}
	console.log("15");
	if (isInteger(timeOutCount) == false) {
		cantStartGame();
		myInputWarning($("#timeOutCount"), "请输入数字");
		return;
	} else {
		cancleWarning($("#timeOutCount"));
	}
	console.log("16");
}

// 当设置出现问题是，不允许开始比赛
function cantStartGame() {
	canStartGame = false;
	$("#prepareGame").html("准备比赛");
	$("#prepareGame").attr("class", "mui-btn mui-btn-primary  mui-btn-outlined  mui-pull-right");
}

// 开始比赛
function startgame() {
	// 将所有需要保存的变量信息保存到文件中
	saveSettings();
	if (canStartGame) {
		mui.openWindow("gamestats.html", "gamestats");
	}
}

// 保存所有设置
function saveSettings() {
	saveStatOptions(); // 保存数据统计记录细节
	saveGameRules(); // 保存比赛规则	
	saveTeamInfos(); // 保存球队信息
	savePlayerInfos(); // 保存球员信息
	settingsJsonString = '{' + statOptionString + ',' + gameRulesString + ',' + teamInfosString + ',' + playerInfosString + '}';
	myStorageHandler_setItem("lastSettings", settingsJsonString);
}

// 保存数据统计记录细节
function saveStatOptions() {
	getStatOptions();
	statOptionString = '"statOptions":{"isNeed24s":' + isNeed24s + ',"isNeedOvertime":' + isNeedOvertime + ',"isNeedRate":' + isNeedRate + ',"isFreeThrow":' + isFreeThrow + ',"isNeedPersonal":' + isNeedPersonal + '}';
}

// 从UI上读取数据统计记录细节
function getStatOptions() {
	isNeed24s = $("#is24s").is(':checked');
	isNeedOvertime = $("#isNeedOverTime").is(':checked');
	isNeedRate = $("#isRate").is(':checked');
	isFreeThrow = $("#isFreeThrow").is(':checked');
	isNeedPersonal = $("#isPersonal").is(':checked');
}

// 保存比赛规则
function saveGameRules() {
	getGameRules();
	gameRulesString = '"gameRules":{"type":"' + gameType + '","gameCount":"' + gameCount + '","totalSections":' + totalSections + ',"gameCountPerSection":' + gameCountPerSection + ',"timeOvertime":' + gameCountOvertime + ',"playersOnCourt":' + playersOnCourt + ',"foulOutCount":' + foulOutCount + ',"timeOutCount":' + timeOutCount + '}';
}

// 从UI上读取比赛规则，并初始化其他相关变量
function getGameRules() {
	gameType = $("input[name='gametype']:checked").val();
	totalSections = $("#totalsections").val();
	gameCountPerSection = $("#gamecountpersection").val();
	gameCountOvertime = $("#gamecountovertime").val();
	playersOnCourt = $("#playersoncourt").val();
	foulOutCount = $("#foulOutCount").val();
	timeOutCount = $("#timeOutCount").val();
}

// 保存队伍信息
function saveTeamInfos() {
	getTeamInfos();
	teamInfosString = '"teamInfos":{"teamNameHome":"' + teamNameHome + '","teamCodeHome":"' + teamCodeHome + '","playerCountsHome":' + playerCountsHome + ',"teamNameGuest":"' + teamNameGuest + '","teamCodeGuest":"' + teamCodeGuest + '","playerCountsGuest":' + playerCountsGuest + '}';
}

// 从UI上读取球队信息，并初始化其他相关变量
function getTeamInfos() {
	teamNameHome = $("#teamNameHome").val();
	teamCodeHome = $("#teamCodeHome").val();
	playerCountsHome = $("#playerCountsHome").val();
	teamNameGuest = $("#teamNameGuest").val();
	teamCodeGuest = $("#teamCodeGuest").val();
	playerCountsGuest = $("#playerCountsGuest").val();
}


// 保存球员信息
function savePlayerInfos() {
	playerInfosString = '"playersInfos":{';
	playerInfosString += '"home":[';
	for (var i = 0; i < homePlayerInfos.length; i++) {
		playerInfosString += parsePlayerInfos(homePlayerInfos[i]);
		if (i + 1 < homePlayerInfos.length) {
			playerInfosString += ',';
		}
	}
	playerInfosString += '],';

	playerInfosString += '"guest":[';
	for (var i = 0; i < guestPlayerInfos.length; i++) {
		playerInfosString += parsePlayerInfos(guestPlayerInfos[i]);
		if (i + 1 < guestPlayerInfos.length) {
			playerInfosString += ',';
		}
	}
	playerInfosString += ']';
	playerInfosString += '}';
}

// 解析球员数据，转换成字符串
function parsePlayerInfos(info) {
	var str = '{"code":"' + info.code + '","no":' + info.no + ',"name":"' + info.name + '"}';
	return str;
}

// 初始化数据统计记录控件
function setStatOptions(statOptions) {
	isNeed24s = statOptions.isNeed24s;
	$("#is24s").attr("checked", isNeed24s);
	isNeedOvertime = statOptions.isNeedOvertime;
	$("#isNeedOverTime").attr("checked", isNeedOvertime);
	isNeedRate = statOptions.isNeedRate;
	$("#isRate").attr("checked", isNeedRate);
	isFreeThrow = statOptions.isFreeThrow;
	$("#isFreeThrow").attr("checked", isFreeThrow);
	isNeedPersonal = statOptions.isNeedPersonal;
	$("#isPersonal").attr("checked", isNeedPersonal);
}

// 初始化比赛规则控件
function setGameRules(gameRules) {
	gameType = gameRules.type;
	totalSections = gameRules.totalSections;
	gameCount = gameRules.gameCount;
	$("#totalsections").val(totalSections);
	gameCountPerSection = gameRules.gameCountPerSection;
	$("#gamecountpersection").val(gameCountPerSection);
	gameCountOvertime = gameRules.gameCountOvertime;
	$("#gamecountovertime").val(gameCountOvertime);
	playersOnCourt = gameRules.playersOnCourt;
	$("#playersoncourt").val(playersOnCourt);
	foulOutCount = gameRules.foulOutCount;
	$("#foulOutCount").val(foulOutCount);
	timeOutCount = gameRules.timeOutCount;
	$("#timeOutCount").val(timeOutCount);
	var type = gameRules.type;
	if (type == 'fiba') {
		$("input[name='gametype'][value='fiba']").attr("checked", true);
	} else if (type == 'cba') {
		$("input[name='gametype'][value='cba']").attr("checked", true);
	} else if (type == 'nba') {
		$("input[name='gametype'][value='nba']").attr("checked", true);
	} else if (type == '3vs3') {
		$("input[name='gametype'][value='3vs3']").attr("checked", true);
	} else if (type == 'self') {
		$("input[name='gametype'][value='self']").attr("checked", true);
		showGameCount(true);
	}
}

// 设置球队信息
function setTeamInfos(teamInfos) {
	teamNameHome = teamInfos.teamNameHome;
	$("#teamNameHome").val(teamNameHome);
	if (teamInfos.teamCodeHome != null && teamInfos.teamCodeHome != 'NULL') {
		$("#teamCodeHome").val(teamInfos.teamCodeHome);
	}
	playerCountsHome = teamInfos.playerCountsHome;
	$("#playerCountsHome").val(playerCountsHome);
	teamNameGuest = teamInfos.teamNameGuest;
	$("#teamNameGuest").val(teamNameGuest);
	if (teamInfos.teamCodeGuest != null && teamInfos.teamCodeGuest != 'NULL') {
		$("#teamCodeGuest").val(teamInfos.teamCodeGuest);
	}
	playerCountsGuest = teamInfos.playerCountsGuest;
	$("#playerCountsGuest").val(playerCountsGuest);
}

// 设置球员信息
function setPlayerInfos(playersInfos) {
	// 主队
	if (playersInfos.home.length != 0) { // 有球员信息
		homePlayerInfos = playersInfos.home;
	}
	// 客队
	if (playersInfos.guest.length != 0) {
		guestPlayerInfos = playersInfos.guest;
	}
	setplayersDisplay();
}

// 初始化队员展示信息
function setplayersDisplay() {
	isNeedPersonal = $("#isPersonal").is(':checked');
	//console.log("isNeedPersonal:" + isNeedPersonal);
	if (isNeedPersonal == false) {
		$("#playersInfoDiscription").html('');
		$("#playersInfos").html('');
		return;
	}
	$("#playersInfoDiscription").html('队员详情，靠前的球员将先发上场。（如果你的队伍有代码，在上面输入代码后，下面会自动生成队员详情）');

	// 在这里增加匿名球员比较合理
	initNoNamePlayers();

	var home = homePlayerInfos;
	var guest = guestPlayerInfos;

	// 两边球员人数的最大值
	playerCountsMax = toolMax(playerCountsGuest, playerCountsHome);

	var htmlStr = '<table width="100%"><th>主队队员</th><th>客队队员</th>';
	var bf = '<div name="playerNumber" class="mui-input-row"><input type="text" id="player';
	var end = ' placeholder="输入队员球衣号" ></div>';
	for (var i = 0; i < playerCountsMax; i++) {
		if (i <= playerCountsHome - 1) {
			if (i < playersOnCourt) {
				htmlStr = htmlStr + "<tr><td style='background:#ef0'>" + bf + "Home" + (i + 1) + '" value="' + home[i].no + "#" + home[i].name + '" ' + end;
			} else {
				htmlStr = htmlStr + "<tr><td>" + bf + "Home" + (i + 1) + '" value="' + home[i].no + "#" + home[i].name + '" ' + end;
			}
		} else {
			htmlStr = htmlStr + "<tr><td>" + bf + "Home" + (i + 1) + '"' + end;
		}

		if (i <= playerCountsGuest - 1) {
			if (i < playersOnCourt) {
				htmlStr = htmlStr + "</td><td style='background:#f50'>" + bf + "Guest" + (i + 1) + '" value="' + guest[i].no + "#" + guest[i].name + '" ' + end + "</td></tr>";
			} else {
				htmlStr = htmlStr + "</td><td>" + bf + "Guest" + (i + 1) + '" value="' + guest[i].no + "#" + guest[i].name + '" ' + end + "</td></tr>";
			}
		} else {
			htmlStr = htmlStr + "</td><td>" + bf + "Guest" + (i + 1) + '" ' + end + "</td></tr>";
		}

	}
	htmlStr = htmlStr + "</table>";
	//	console.log("htmlStr:" + htmlStr);
	$("#playersInfos").html(htmlStr);
	$("div [name='playerNumber']").addClass("mui-input-row");
}

// 增加匿名球员的信息
function initNoNamePlayers() {
	playerCountsHome = $("#playerCountsHome").val();
	playerCountsGuest = $("#playerCountsGuest").val();

	if (homePlayerInfos.length < playerCountsHome) {
		// 增加匿名球员
		var cha = playerCountsHome - homePlayerInfos.length; //相差人数
		var len = homePlayerInfos.length;
		var jerseyNos = new Array(); // 所有的球员号码，为了下面的球衣号码不重复
		for (var i = 0; i < len; i++) { // 初始化所有球员号码
			jerseyNos[i] = homePlayerInfos[i].no;
		}
		for (var i = 0; i < cha; i++) {
			var jno = getJerseyNo(jerseyNos);
			homePlayerInfos[len + i] = {
				"code": "x",
				"no": jno,
				"name": "匿名" + i
			};
			jerseyNos[jerseyNos.length] = jno;
		}
	}

	if (guestPlayerInfos.length < playerCountsGuest) { // 球员实际人数少于上场人数
		// 增加匿名球员
		var cha = playerCountsGuest - guestPlayerInfos.length; //相差人数
		var len = guestPlayerInfos.length;
		var jerseyNos = new Array(); // 所有的球员号码，为了下面的球衣号码不重复
		for (var i = 0; i < len; i++) {
			jerseyNos[i] = guestPlayerInfos[i].no;
		}
		for (var i = 0; i < cha; i++) {
			var jno = getJerseyNo(jerseyNos);
			guestPlayerInfos[len + i] = {
				"code": "x",
				"no": jno,
				"name": "匿名" + i
			};
			jerseyNos[jerseyNos.length] = jno;
		}
	}
}

// 从给定的数字中生成一个不同的球衣号码
function getJerseyNo(numbers) {
	var start = 1,
		end = 99; //号码生成空间
	if (gameType == 'fiba') {
		start = 3;
		end = 15;
	}
	var no;
	while (true) {
		no = parseInt(Math.random() * (end - start + 1) + start); //生成从start 到 end之间的数字
		var isFound = false;
		for (var i = 0; i < numbers.length; i++) {
			if (no == numbers[i]) {
				isFound = true;
				break;
			}
		}
		if (isFound == true) {
			continue;
		} else {
			break;
		}
	}
	return no;
}

// 比较大小的工具方法
function toolMax(a, b) {
	if (a > b) {
		return a;
	} else {
		return b;
	}
}

// 设置比赛类型
// 当比赛类型UI控件被操作，相应的变量和控件也随之变化
function setGameType(type) {
	console.log("setGameType here.");
	gameType = type;
	if (type == 'fiba') {
		totalSections = 4;
		gameCountPerSection = 10;
		gameCountOvertime = 5;
		playersOnCourt = 5;
		foulOutCount = 5;
	} else if (type == 'cba') {
		totalSections = 4;
		gameCountPerSection = 10;
		gameCountOvertime = 5;
		playersOnCourt = 5;
		foulOutCount = 5;
	} else if (type == 'nba') {
		totalSections = 4;
		gameCountPerSection = 12;
		gameCountOvertime = 5;
		playersOnCourt = 5;
		foulOutCount = 6;
	} else if (type == '3vs3') {
		totalSections = 1;
		gameCountPerSection = 15;
		gameCountOvertime = 5;
		playersOnCourt = 3;
		foulOutCount = 6;
	} else if (type == 'self') {
		$("#selfGameType").attr("checked", "checked");
		totalSections = $("#totalsections").val();
		gameCountPerSection = $("#gamecountpersection").val();
		gameCountOvertime = $("#gamecountovertime").val();
		playersOnCourt = $("#playersoncourt").val();
		foulOutCount = $("#foulOutCount").val();
		timeOutCount = $("#timeOutCount").val();
		verifySettings();
	}

	if (type != 'self') {
		gameCount = 'time';
		showGameCount(false);
	} else {
		showGameCount(true);
	}

	$("#totalsections").val(totalSections);
	$("#gamecountpersection").val(gameCountPerSection);
	$("#gamecountovertime").val(gameCountOvertime);
	$("#playersoncourt").val(playersOnCourt);
	$("#foulOutCount").val(foulOutCount);

	//	if (type != 'self') {
	//		$("#playerCountsHome").val(playersOnCourt + 3);
	//		$("#playerCountsGuest").val(playersOnCourt + 3);
	//	}
}

// 是否显示自定义比赛的结束方式
function showGameCount(isShown) {
	var attr = "background: #4CD964;";
	if (isShown == false) {
		attr = "display:none;" + attr;
	}
	$("#gameCount").attr("style", attr);
	setGameCountDisplay();
}

// 显示自定义比赛结束方式相关的UI控件
function setGameCountDisplay() {
	if (gameCount == 'score') {
		$("#gameCountScore").attr("checked", "checked");
		$("#labelgamecountpersection").html("每节需要打满的分数");
		$("#gamecountpersection").attr("placeholder", "填写分数");
		$("#gamecountpersection").attr("value", gameCountPerSection);
		$("#labelgamecountovertime").html("加时赛需要打满的分数");
		$("#gamecountovertime").attr("placeholder", "填写分数");
		$("#gamecountovertime").attr("value", gameCountOvertime);
	} else {
		$("#gameCountTime").attr("checked", "checked");
		$("#labelgamecountpersection").html("每节比赛时间（分钟）");
		$("#gamecountpersection").attr("placeholder", "填写分钟数");
		$("#gamecountpersection").attr("value", gameCountPerSection);
		$("#labelgamecountovertime").html("加时赛时间（分钟）");
		$("#gamecountovertime").attr("placeholder", "填写分钟数");
		$("#gamecountovertime").attr("value", gameCountOvertime);
	}
}

// 响应比赛结束方式控件的选择事件
function setGameCount(v) {
	gameCount = v;
	setGameCountDisplay();
}

// 设置队员
function setplayerCounts() {
	if (isNeedPersonal == false) { // 如果不需要统计个人，不需要处理
		return;
	}

	var h = $("#playerCountsHome").val();
	var g = $("#playerCountsGuest").val();

	if (h == '' && g == '') {
		mui.toast("球队人数不能为空！");
		myAnimate($("#playerCountsHome"), 8);
		myAnimate($("#playerCountsGuest"), 8);
		return;
	}

	if (h == '' && isNaN(g) == false) {
		return;
	}
	if (g == '' && isNaN(h) == false) {
		return;
	}

	if (isNaN(h) == true) {
		$("#playerCountsHome").val(playerCountsHome);
		mui.toast("请输入数字！");
		myAnimate($("#playerCountsHome"), 8);
	}
	if (isNaN(g) == true) {
		$("#playerCountsGuest").val(playerCountsGuest);
		mui.toast("请输入数字！");
		myAnimate($("#playerCountsGuest"), 8);
	}
	// 均输入了合理的值
	if (isNaN(h) == false && isNaN(g) == false) {
		if (h < playersOnCourt) { // 小于应上场人数
			$("#playerCountsHome").val(playerCountsHome);
			mui.toast("输入的人数必须不小于上场人数啊！");
			myAnimate($("#playerCountsHome"), 8);
		} else if (h > playerCountsLimit) { // 超过最大人数
			$("#playerCountsHome").val(playerCountsLimit);
			mui.toast("有那么多人吗？已经给你设置成最大人数了哦。^_^");
			myAnimate($("#playerCountsHome"), 8);
		}

		if (g < playersOnCourt) { // 小于应上场人数
			$("#playerCountsGuest").val(playerCountsGuest);
			mui.toast("输入的人数必须不小于上场人数啊！");
			animateEl = $("#playerCountsGuest");
			myAnimate($("#playerCountsGuest"), 8);
		} else if (g > playerCountsLimit) { // 超过最大人数
			$("#playerCountsGuest").val(playerCountsLimit);
			mui.toast("有那么多人吗？已经给你设置成最大人数了哦。^_^");
			myAnimate($("#playerCountsGuest"), 8);
		}
		setplayersDisplay();
	}
}

// 当队伍人数输入时，用一个对话框来判断，就可以避免了输入数字合理步骤中的强行判断
function tapPlayerCounts(whichSide) {
	//	mui.prompt('text','deftext','title',['true','false'],null,'div')
	var text;
	var deftext = '原来输入的是';
	if (whichSide == 'home') {
		text = '主队的哦';
		deftext += $("#playerCountsHome").val();
	} else {
		text = '客队的哦';
		deftext += $("#playerCountsGuest").val();
	}
	mui.prompt(text, deftext, '请输入球员人数', ['确定', '取消'], function(e) { // 文档里啥都没有！幸好有网友！
		if (e.index == 0) {
			if (whichSide == 'home') {
				$("#playerCountsHome").val(e.value);
			} else {
				$("#playerCountsGuest").val(e.value);
			}
		}
		setplayerCounts();
	}, null); // 最后一个参数用 'div'，对话窗口用的是h5绘制的，搞丢在这里不对，所以用原生的了
}