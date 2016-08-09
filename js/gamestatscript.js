// 比赛中数据统计的脚本
// 根据用户初始设定的环境变量
var gameType; // 比赛类型
var isNeedOffensiveTimeLimit = false; // 是否需要记录进攻时限
var isShowOffensiveTime = true;
var firstOffensiveTimeLimit = 24,
	secondOffensiveTimeLimit = 14;
var totalSections = 4; // 比赛总节数
var gameCount = "time"; // 比赛结束记录方式，时间或者分数
var currentSection = 1; // 当前节数
var gameCountPerSection; // 每一节结束的满足条件，比分或者时间
var gameCountOvertime; // 加时赛的结束满足条件
var isFreeThrow = true; // 是否需要罚球
var isNeedPersonal = true; // 是否需要记录每个人的数据
var isNeedOvertime = true; // 是否需要加时
var isCountFoul = true; // 是否记录犯规
var foulOutCount = 6; // 犯规次数
var foulsPersection = 4; // 单节犯规
var timeOutCount = 10; // 可用暂停次数
var isShotOnly = false; // 是否只记录投篮一种技术
var isNeedRate = true; // 是否需要统计命中率
var playersOnCourt = 5; // 单边在场人数
// 技术统计变量
var teamTSHome, teamTSGuest;
var tsArrayHome = new Array();
var tsArrayGuest = new Array();

var isAlarmedOffensiveTimeup = false,
	isAlarmedGameTimeup = false;

var playerCountsHome = 0,
	playerCountsGuest = 0,
	playerCountsMax = 0;

var teamNameHome, teamNameGuest; // 队伍显示的名字	
var teamCodeHome, teamCodeGuest; // 队伍代码	

// 参与计算的变量
var homeScoreCurrentSection = 0,
	guestScoreCurrentSection = 0; //当用计分模式来作为每节比赛的终点时所用
var gametime_c = 1 * 60 * 1000; // 用来计算的比赛时间 game time，设置后时间暂停是保存
var gametimeLeft = 0; // 剩余比赛时间，用来计算，辅助于显示
var st_m_gametime = '0'; // 比赛时间分钟
var st_s_gametime = '0'; // 比赛时间秒数
var lastCalculateGameTime; // 上一次计时起点
var lastCalculateOffTime; // 上一次进攻计时起点
var gametime_distance = 0; // 与上一次比赛时间计时起点的差值
var offtime_distance = 0; // 与上一次进攻时间计时起点的差值
var isGametimeUp = false; // 是否到时间
var isGameEnd = false; // 是否比赛结束
var isForceModify = false; // 是否强行修改技术统计（比赛结束后仍然修改）
var showMin = true; // 是否显示分钟
var pause = true; // 是否暂停
var offensivetime_c; // 用来计算的进攻时限
var offensivetimeLeft; // 剩余进攻时限时间
var st_off = '00s'; // 用于展示的进攻时限 showTime offensivetime
var isOffensiveLimitTimeup = false; // 进攻时限是否到时间
var homescore = 0,
	guestscore = 0; // 主、客队计分；
var tsRecordsHome = new TSRecordsController(); // 加分的记录，主队
var tsRecordsGuest = new TSRecordsController(); // 加分的记录，客队
var techRecord; // 临时记录数据统计的全局变量，避开传值
var teamfoulsCurSectionHome = 0,
	teamfoulsCurSectionGuest = 0;
var isOvertime = false;
var canShareGame = false; // 是否可以分享比赛

// 当进入比赛数据统计页面后，先初始化相关变量和UI
function initGame() {
	// 能到这一步，说明已经保存了相关的数据，读取这些设置数据用于初始化
	var statSettings = loadSettings("lastSettings");
	initStatOptions(statSettings.statOptions); // 设置数据统计记录细节
	initGameRules(statSettings.gameRules); // 设置比赛规则
	initTeamInfos(statSettings.teamInfos); // 设置球队信息
	initPlayersInfos(statSettings.playersInfos); // 设置球员信息
	initOtherVariables(); // 初始化其他变量
	initTSSettings();
}

// 设置数据统计记录细节
function initStatOptions(statOptions) {
	isNeedOffensiveTimeLimit = statOptions.isNeedOffensiveTimeLimit;
	isNeedOvertime = statOptions.isNeedOvertime;
	isNeedRate = statOptions.isNeedRate;
	isShotOnly = statOptions.isShotOnly;
	if (isShotOnly) {
		$("#otherTechDIV").attr("style", "display:none");
	}
	isCountFoul = statOptions.isCountFoul;
	isFreeThrow = statOptions.isFreeThrow;
	isNeedPersonal = statOptions.isNeedPersonal;
}

// 设置比赛规则
function initGameRules(gameRules) {
	gameType = gameRules.type;
	totalSections = gameRules.totalSections;
	gameCount = gameRules.gameCount;
	gameCountPerSection = gameRules.gameCountPerSection;
	gameCountOvertime = gameRules.gameCountOvertime;
	setGameTimeCount(gameCountPerSection, 0); // 设置比赛时间
	firstOffensiveTimeLimit = gameRules.firstOffensiveTimeLimit;
	secondOffensiveTimeLimit = gameRules.secondOffensiveTimeLimit;
	setOffensiveTimeLimit(true, firstOffensiveTimeLimit); // 设置进攻时限时间
	setTimeControllerUI(); // 设置与比赛时间有关控制的UI
	playersOnCourt = gameRules.playersOnCourt;
	foulOutCount = gameRules.foulOutCount;
	foulsPersection = gameRules.foulsPersection;
	timeOutCount = gameRules.timeOutCount;
	var type = gameRules.type;
	//	if (type == 'fiba') {
	//	} else if (type == 'cba') {
	//	} else if (type == 'nba') {
	//	} else if (type == '3vs3') {
	//	} else if (type == 'self') {
	//	}
}

// 设置球队信息
function initTeamInfos(teamInfos) {
	teamNameHome = teamInfos.teamNameHome;
	$("#homename").val(teamNameHome);
	teamCodeHome = teamInfos.teamCodeHome;
	playerCountsHome = teamInfos.playerCountsHome;
	teamNameGuest = teamInfos.teamNameGuest;
	$("#guestname").val(teamNameGuest);
	teamCodeGuest = teamInfos.teamCodeGuest;
	playerCountsGuest = teamInfos.playerCountsGuest;
	teamTSHome = new PlayerTechStats(teamCodeHome, "HOME", teamNameHome);
	teamTSGuest = new PlayerTechStats(teamCodeGuest, "GUEST", teamNameGuest);
	tsArrayHome[0] = teamTSHome;
	tsArrayGuest[0] = teamTSGuest;
}

// 设置球员信息
function initPlayersInfos(playersInfos) {
	//	console.log("initPlayersInfos");
	if (isNeedPersonal) {
		for (var i = 0; i < playerCountsHome; i++) {
			var player = playersInfos.home[i];
			tsArrayHome[i + 1] = new PlayerTechStats(player.code, player.no, player.name);
			if (i < playersOnCourt) { // 设置上场比赛人员的上场属性
				tsArrayHome[i + 1].isOncourt = true;
			} else {
				tsArrayHome[i + 1].isOncourt = false;
			}
		}
		for (var i = 0; i < playerCountsGuest; i++) {
			var player = playersInfos.guest[i];
			tsArrayGuest[i + 1] = new PlayerTechStats(player.code, player.no, player.name);
			if (i < playersOnCourt) { // 设置上场比赛人员的上场属性
				tsArrayGuest[i + 1].isOncourt = true;
			} else {
				tsArrayGuest[i + 1].isOncourt = false;
			}
		}
	} else {
		$("#substituteDIV").attr("style", "display:none");
	}
}

// 初始化其他变量
function initOtherVariables() {

}

// 【Start】与时间计算和显示有关的方法
// 倒计时更新
function show_time() {
	if (pause == true) { // 暂停
		return;
	}
	if (isGametimeUp) { // 比赛时间到
		return;
	}
	// 计算与上一次计时起点的差值
	calculateDistance();
	if (gameCount == 'time') { // 需要展示比赛时间
		// 计算剩余时间
		gametimeLeft = gametime_c - gametime_distance;
		setGameTimeDisplayStr();
	}
	if (isNeedOffensiveTimeLimit) { // 需要展示进攻时间
		offensivetimeLeft = offensivetime_c - offtime_distance;
		setOffensiveTimeDisplayStr();
	}
	// 设置时间显示
	setShowTime();
	// 回调
	// 当比赛时间小于1分钟或者进攻时限小于10秒时，加快时间方法的调用频率
	if (showMin == false || offensivetimeLeft < 10000) {
		setTimeout("show_time()", 100);
	} else {
		setTimeout("show_time()", 500);
	}
}

// 设置比赛时间显示的字符串
function setGameTimeDisplayStr() {
	if (gametimeLeft > 0) { // 比赛没有结束
		// 计算剩余分钟
		var tm = Math.floor(gametimeLeft / (1000 * 60)); // timeMinute
		if (tm < 10) {
			st_m_gametime = '0' + tm;
		} else {
			st_m_gametime = tm;
		}
		if (tm == 0) {
			showMin = false;
		} else {
			showMin = true;
		}
		// 计算剩余的秒数
		var ts = (gametimeLeft % (1000 * 60)) / 1000; // timeSecond
		//		console.log("ts:" + ts);
		if (ts == 0) {
			st_s_gametime = '00';
		} else if (ts < 10) { // 秒数小于10s
			if (showMin == false) { // 不需要显示分钟
				st_s_gametime = ('' + ts).substr(0, 3) + 's';
			} else { // 需要显示分钟
				st_s_gametime = ('0' + ts).substr(0, 2);
			}
		} else { // 秒数大于10s
			if (showMin == false) { // 不需要显示分钟
				st_s_gametime = ('' + ts).substr(0, 4) + 's';
			} else { // 需要显示分钟
				st_s_gametime = ('' + ts).substr(0, 2);
			}
		}
	} else {
		isGametimeUp = true;
		pause = true;
		$("#controlgameTime").html('开始计时');
	}
}

function setOffensiveTimeDisplayStr() {
	var temp1 = firstOffensiveTimeLimit * 1000;
	var temp2 = secondOffensiveTimeLimit * 1000;
	// 判断是否需要展示进攻时间
	if (gameCount == 'score') {
		if (isNeedOffensiveTimeLimit == true) {
			// 计分模式下但是要记录进攻时间，就一直需要显示
			isShowOffensiveTime = true;
		}
	} else if (gameCount == 'time') { // 计时模式下
		if (isNeedOffensiveTimeLimit == true) {
			if (gametimeLeft < offensivetimeLeft) { // 比赛时间比当前进攻时间小，就不用显示了
				isShowOffensiveTime = false;
			} else {
				isShowOffensiveTime = true;
			}
		} else {
			isShowOffensiveTime = false;
		}
	}
	if (isShowOffensiveTime) {
		// 计算剩余的秒数
		var ots = (offensivetimeLeft % (1000 * 60)) / 1000;
		if (ots <= 0) {
			st_off = '00.0s';
			isOffensiveLimitTimeup = true;
		} else if (ots < 10) {
			if (ots < 6) { // 需要展示毫秒
				st_off = ('0' + ots).substr(0, 4) + 's';
			} else {
				st_off = ('0' + ots).substr(0, 2) + 's';
			}
		} else {
			st_off = ('' + ots).substr(0, 2) + 's';
		}
	} else {
		st_off = '00.0s';
	}
}

// 显示时间
function setShowTime() {
	if (isOffensiveLimitTimeup == true) { // 需要显示进攻限制时间
		$("#offensivetime").html("00.0s");
		if (isAlarmedOffensiveTimeup == false) { // 播放提示音
			playSound('timeup');
			isAlarmedOffensiveTimeup = true;
		}
	} else {
		$("#offensivetime").html(st_off);
	}
	if (gameCount == 'time') { // 计时模式，需要显示比赛时间
		if (isGametimeUp == true) {
			if (isAlarmedGameTimeup == false) { // 播放提示音
				playSound('timeup');
				isAlarmedGameTimeup = true;
			}
			gotoNextSection(); // 时间到，进入下一节
		} else {
			if (showMin == false) {
				$("#gameCount").html(st_s_gametime);
			} else {
				$("#gameCount").html(st_m_gametime + ":" + st_s_gametime);
			}
		}
	}
}

// 设置控制时间的控件UI
function setTimeControllerUI() {
	// 当计分赛且不需要进攻时限时，时间控制按钮都不需要
	if (isNeedOffensiveTimeLimit == false && gameCount == 'score') {
		$("#timeControl").attr("style", "display:none");
	} else {
		$("#controlgameTime").attr("style", "");
		$("#controlgameTime").html('开始计时');
	}
	if (gameCount == 'score') {
		$("#gameCountLabel").html("计分赛");
	} else { // 计时赛
		$("#gameCountLabel").html("时间");
		setGameTimeCount(gameCountPerSection, 0);
		setGameTimeDisplayStr();
	}
	if (isNeedOffensiveTimeLimit) {
		$("#offensiveTimeLimitBT").html(firstOffensiveTimeLimit + 's');
		$("#resetoffensiveTimeLimitBT").html(secondOffensiveTimeLimit + 's');
		setOffensiveTimeLimit(true, firstOffensiveTimeLimit);
		setOffensiveTimeDisplayStr();
	} else {
		$("#OffensiveShow1").attr("style", "display:none");
		$("#OffensiveShow2").attr("style", "display:none");
	}
	setShowTime();
}

// 设定比赛时间的上次计时起点
function setLastGameTimeStamp() {
	lastCalculateGameTime = new Date().getTime(); //设定为当前时间
}
// 设定进攻时间上次计时起点
function setLastOffensiveLimitTimeStamp() {
	lastCalculateOffTime = new Date().getTime(); //设定当为前时间
}
// 计算两次计时之间经历的时间差
function calculateDistance() {
	var now = new Date().getTime();
	gametime_distance = now - lastCalculateGameTime;
	offtime_distance = now - lastCalculateOffTime;
}

// 计时开始入口方法
function controlGameTime() {
	var aa = $("#controlgameTime").html();
	if (aa == '开始计时') {
		if(gameCount == 'time' && gametimeLeft <=0){
			myAnimate($("#gameCount"), 8, "时间已到!", $("#gameCount").attr("style"));
			return;
		}
		$("#controlgameTime").html('暂停计时');
		pause = false;
		if (gametime_distance != 0) { // 原来已经走过的时间不为零，需要修改下一次倒计时时长
			gametime_c = gametime_c - gametime_distance; // 剩余用于计算的比赛时间长度
		}
		setLastGameTimeStamp();
		if (offtime_distance != 0) { // 原来已经走过的时间不为零，需要修改下一次倒计时时长
			offensivetime_c = offensivetime_c - offtime_distance; // 剩余用于计算的比赛时限时间长度
		}
		setLastOffensiveLimitTimeStamp();
		show_time();
	} else if (aa == '暂停计时') {
		pause = true;
		$("#controlgameTime").html('开始计时');
	}
}

// 设置比赛计时变量
function setGameTimeCount(timeMin, timeSec) {
	gametime_c = (60 * timeMin + timeSec) * 1000; // 用于计算的总的比赛时间
	gametimeLeft = gametime_c;
	gametime_distance = 0;
	if(isGametimeUp){
		$("#nextSection").attr("style", "display:none");
		isGametimeUp = false;
	}
	isAlarmedGameTimeup = false;
}

// 设置进攻时限变量
// param: isFirst:是否是第一次进攻时限,当其为null时，直接设置为给定值（timeValue）
function setOffensiveTimeLimit(isFirst, timeValue) {
	var time = 0;
	if (isFirst != null) {
		if (isFirst) {
			time = firstOffensiveTimeLimit;
		} else {
			time = secondOffensiveTimeLimit;
		}
	} else {
		time = timeValue;
	}
	offtime_distance = 0;
	var temp = time * 1000;
	if (gameCount == 'score') {
		$("#offensivetime").html(time + 's');
	} else {
		if (gametimeLeft < temp) {
			$("#offensivetime").html('00.0s');
		} else {
			$("#offensivetime").html(time + 's');
		}
	}
	offensivetime_c = time * 1000;
	offensivetimeLeft = offensivetime_c;
	if (isFirst != null) {
		setLastOffensiveLimitTimeStamp();
	}
	isOffensiveLimitTimeup = false;
	isAlarmedOffensiveTimeup = false;
}

// 初始化弹出菜单，设置比赛时间
function initGameTimeSettingPopoverHTML(minGT, secGT, oft) {
	var htmlStr = '<h3 id="subTitle">手动设置比赛时间</h3><table>';
	if (gameCount == 'time') {
		htmlStr = htmlStr + '<tr><td width="25%">比赛时间:</td><td width="30%"><input type="text" id="minGT" placeholder="分钟" value="' +
			minGT + '" ></td><td width="5%"><b>:</b></td><td width="30%"><input type="text" id="secGT" placeholder="秒" value="' + secGT + '"></td><td width="5%"></td></tr>';
	}
	if (isNeedOffensiveTimeLimit) {
		htmlStr = htmlStr + '<tr><td>进攻时限:</td><td><input type="text" id="oft" placeholder="秒" value="' +
			oft + '"></td></tr>';
	}
	htmlStr = htmlStr + '</table><button type="button" onclick="setTimeOK()" class="mui-btn mui-btn-success">完成</button> ' +
		' <button type="button" onclick="cancelSetTime()" class="mui-btn mui-btn-warning">取消</button>';
	//	console.log("htmlStr:" + htmlStr);
	$("#myPopover").html(htmlStr);
	showORhidePopover();
}

// 将输入得到的时间值设置进时间参数中
function setTimeOK() {
	var minGT = $("#minGT").val() * 1;
	var secGT = $("#secGT").val() * 1;
	var oft = $("#oft").val() * 1;
	var isSettingOK = true;
	if (gameCount == 'time') {
		if (isInteger(minGT) == false) {
			isSettingOK = false;
			myAnimate($("#minGT"), 8, "请输入整数！", $("#minGT").attr("style"));
		}
		if (isNaN(secGT)) {
			isSettingOK = false;
			myAnimate($("#secGT"), 8, "请输入数字！", $("#secGT").attr("style"));
		}
		if ((minGT * 60 + secGT) > (gameCountPerSection * 60)) {
			isSettingOK = false;
			myAnimate($("#minGT"), 8, "超过单节比赛时间" + gameCountPerSection + "分钟！", $("#minGT").attr("style"));
			myAnimate($("#secGT"), 8, null, $("#secGT").attr("style"));
		}
	}
	if (isNeedOffensiveTimeLimit) {
		if (isNaN(oft)) {
			isSettingOK = false;
			myAnimate($("#oft"), 8, "请输入数字！", $("#oft").attr("style"));
		} else {
			if (oft > firstOffensiveTimeLimit) {
				isSettingOK = false;
				myAnimate($("#oft"), 8, "不能超过最大进攻时限" + firstOffensiveTimeLimit + "秒！", $("#oft").attr("style"));
			}
		}
	}
	if (isSettingOK) {
		// 设置比赛时间并恢复比赛
		//		if (isGametimeUp) { // 比赛终了时重新设置
		//			currentSection--;
		//			setSectionShow(currentSection);
		//		}
		if (gameCount == 'time') {
			setGameTimeCount(minGT, secGT); // 设置比赛时间
			setGameTimeDisplayStr();
			setLastGameTimeStamp();
		}
		if (isNeedOffensiveTimeLimit) { // 设置进攻时限
			setOffensiveTimeLimit(null, oft);
			setOffensiveTimeDisplayStr();
			setLastOffensiveLimitTimeStamp();
		}
		showORhidePopover();
		setShowTime();
		//		controlGameTime();
		//		controlGameTime();
	}
}
// 取消设置时间
function cancelSetTime() {
	showORhidePopover();
}

// 弹出时间设置
function setGameTime() {
	// 先暂停
	if (pause == false) {
		controlGameTime();
	}
	// 先获取得到当前的时间
	var gt = gametimeLeft;
	var oft = offensivetimeLeft;
	// 转换成分秒
	// 计算剩余分钟
	var tm = Math.floor(gt / (1000 * 60)); // timeMinute
	// 计算剩余的秒数
	var ts = (gametimeLeft % (1000 * 60)) / 1000; // timeSecond
	if (tm < 0) {
		tm = 0;
		ts = 0;
	}
	var oftSec = offensivetimeLeft / 1000;
	if (oftSec < 0) {
		oftSec = 0;
	}
	// 初始化弹出Popover
	initGameTimeSettingPopoverHTML(tm, ts, oftSec);
}

// 【End】时间设置有关逻辑

// 【Start】比赛数据统计逻辑
// 定义自己的类，用来记录操作（主要是为了完成撤销动作）
function TSRecordsController() {
	var lastModifiedIndex = -1; // 上一次更改记录的位置
	var modifiedTSes = new Array(); // 修改的记录
	// 新增加一次操作
	this.modifyTS = function(tsRecord) {
			// 先修改下标
			lastModifiedIndex = lastModifiedIndex + 1;
			if (lastModifiedIndex > 4) {
				lastModifiedIndex = 4;
			}
			doRealModify(tsRecord, lastModifiedIndex);
		}
		// 加上这次统计
	var doRealModify = function(tsRecord, stopIndex) {
			if (stopIndex == 4) {
				for (var i = 0; i < stopIndex; i++) {
					modifiedTSes[i] = modifiedTSes[i + 1];
				}
			}
			modifiedTSes[stopIndex] = tsRecord;
		}
		// 撤销操作
	this.undoModify = function() {
		if (lastModifiedIndex == -1) {
			return 0;
		} else {
			return modifiedTSes[lastModifiedIndex--];
		}
	}
}

// 记录每次技术统计的类 ，每一次操作都会生成
function TSRecord() {
	this.name; // 技术统计名称
	this.otherInfo; // 技术统计其他信息
	this.data; // 技术统计数据
	this.whichSide; // 技术统计归属方
	this.player; // 技术统计归属具体球员
}

// 从网页按钮传来的数据统计添加方法
function addSTAT(whichSide, statname, otherInfo) {
	if (isGameEnd == false || isForceModify == true) {
		var tsRecord = new TSRecord();
		tsRecord.name = statname;
		tsRecord.otherInfo = otherInfo;
		tsRecord.data = 1;
		tsRecord.whichSide = whichSide;
		tsRecord.player = 'unknown';
		if (isNeedPersonal) { // 需要统计到个人
			showWindow_whichPlayer(tsRecord);
		} else {
			addTS(tsRecord);
		}
		isForceModify = false;
	} else {
		confirm_forcedModify(whichSide, statname, otherInfo);
	}
}

// 添加技术统计
function addTS(tsRecord) {
	// 从所有拥有技术统计的对象中选择需要添加的那个
	var tsArray;
	if (tsRecord.whichSide == 0) {
		if (tsRecord.data > 0) { // 数据大于0，是正常添加，需要记录
			tsRecordsHome.modifyTS(tsRecord);
		}
		tsArray = tsArrayHome;
	} else {
		if (tsRecord.data > 0) {
			tsRecordsGuest.modifyTS(tsRecord);
		}
		tsArray = tsArrayGuest;
	}
	// 先添加团队的
	tsArray[0].addStatistics(tsRecord);
	if (tsRecord.player != 'unknown') { // 需要添加到个人
		var obj = findTSPlayer(tsArray, tsRecord.player);
		if (obj != "notFound") {
			obj.addStatistics(tsRecord);
		}
	}
	showTechnicalSes();
	if (tsRecord.name == "POINTS") {
		if (gameCount == "score") { // 计分模式
			if (homeScoreCurrentSection > gameCountPerSection || guestScoreCurrentSection > gameCountPerSection) { // 某一方得分超过了设定
				gotoNextSection();
			}
		}
	}
}

// 根据球员名字在传进来的队列中寻找并返回该球员的技术统计对象
function findTSPlayer(tsArray, player) {
	for (var i = 0; i < tsArray.length; i++) {
		if (tsArray[i].no == player) {
			//			console.log("find player:" + tsArray[i].no);
			return tsArray[i];
		}
	}
	return "notFound";
}


// 定义自己的类，用来做技术统计
function PlayerTechStats(code, no, name) {
	var _this = this; // 把this保存下来，以后用_this代替this，这样就不会被this弄晕了 
	_this.code = code;
	_this.no = no;
	_this.name = name; // 统计归属
	_this.isOncourt = false; // 是否在场上
	_this.editable = true; // 被驱逐出场就不能被编辑了
	_this.points = 0; // 总得分
	// 出手次数，命中次数，命中率
	_this.tP = 0,
		_this.tPin = 0,
		_this.tFG = 0,
		_this.t1P = 0,
		_this.t1Pin = 0,
		_this.t1FG = 0,
		_this.t2P = 0,
		_this.t2Pin = 0,
		_this.t2FG = 0,
		_this.t3P = 0,
		_this.t3Pin = 0,
		_this.t3FG = 0;
	// 篮板，进攻篮板，助攻，失误，盖帽，断球，犯规,进攻犯规
	_this.tREBS = 0,
		_this.tOREBS = 0,
		_this.tAST = 0,
		_this.tTO = 0,
		_this.tBLK = 0,
		_this.tSTL = 0,
		_this.tFOUL = 0,
		_this.tOFOUL = 0;
	_this.scorePerSection = initArrayWithLength(totalSections); // 每节得分

	// 增加技术统计 参数：技术名称，所加数值（可正可负）, 其他信息
	this.addStatistics = function(tsRecord) {
		console.log("addTS whichSide:" + tsRecord.whichSide + "; player:" + tsRecord.player + ";techName:" + tsRecord.name + "; data:" + tsRecord.data + "; otherInfo:" + tsRecord.otherInfo);
		if (tsRecord.name == "REB") { // 篮板
			_this.tREBS = _this.tREBS + tsRecord.data;
			if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻篮板
				_this.tOREBS = _this.tOREBS + tsRecord.data;
			}
		} else if (tsRecord.name == "FOUL") { // 犯规
			console.log("name:" + _this.no);
			var isTeam = false;
			if (_this.no == "HOME") { // 球队需要统计本节犯规累计
				isTeam = true;
				teamfoulsCurSectionHome = teamfoulsCurSectionHome + tsRecord.data;
			} else if (_this.no == "GUEST") {
				isTeam = true;
				teamfoulsCurSectionGuest = teamfoulsCurSectionGuest + tsRecord.data;
			}
			if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻犯规
				_this.tOFOUL = _this.tOFOUL + tsRecord.data;
			}
			_this.tFOUL = _this.tFOUL + tsRecord.data;
			if (isNeedPersonal) {
				if (isTeam == false) {
					if (_this.tFOUL == foulOutCount) { // 犯规次数达到，强制换人
						substitutePlayer(tsRecord.whichSide);
					}
				}
			}
		} else if (tsRecord.name == "POINTS") { // 得分
			addScore(tsRecord.data, tsRecord.otherInfo);
		} else { // 其余的技术
			addNormalStatistics(tsRecord.name, tsRecord.data);
		}
	}

	// 统计比分和相关技术
	var addScore = function(score, isIn) {
		if (score > 0) { // 是得分
			if (isIn) { // 进球了
				switch (score) {
					case 1:
						_this.t1P = _this.t1P + 1; // 1分球次数
						_this.t1Pin = _this.t1Pin + 1; // 1分球命中次数
						break;
					case 2:
						_this.t2P = _this.t2P + 1; // 2分球次数
						_this.t2Pin = _this.t2Pin + 1; // 2分球命中次数
						break;
					case 3:
						_this.t3P = _this.t3P + 1; // 3分球次数
						_this.t3Pin = _this.t3Pin + 1; // 3分球命中次数
						break;
				}
				_this.points = _this.points + score;
				_this.scorePerSection[currentSection - 1] = _this.scorePerSection[currentSection - 1] + score; // 添加本节得分
				_this.tPin = _this.tPin + 1;
			} else { // 没有进球
				switch (score) {
					case 1:
						_this.t1P = _this.t1P + 1; // 1分球次数
						break;
					case 2:
						_this.t2P = _this.t2P + 1; // 2分球次数
						break;
					case 3:
						_this.t3P = _this.t3P + 1; // 3分球次数
						break;
				}
			}
			_this.tP = _this.tP + 1;
		} else { // 撤销得分
			if (isIn) {
				switch (score) {
					case -1:
						_this.t1P = _this.t1P - 1; // 1分球次数
						_this.t1Pin = _this.t1Pin - 1; // 1分球命中次数
						break;
					case -2:
						_this.t2P = _this.t2P - 1; // 2分球次数
						_this.t2Pin = _this.t2Pin - 1; // 2分球命中次数
						break;
					case -3:
						_this.t3P = _this.t3P - 1; // 3分球次数
						_this.t3Pin = _this.t3Pin - 1; // 3分球命中次数
						break;
				}
				_this.tPin = _this.tPin - 1;
				_this.points = _this.points + score;
				_this.scorePerSection[currentSection - 1] = _this.scorePerSection[currentSection - 1] + score; // 添加本节得分
			} else {
				switch (score) {
					case -1:
						_this.t1P = _this.t1P - 1; // 1分球次数
						break;
					case -2:
						_this.t2P = _this.t2P - 1; // 2分球次数
						break;
					case -3:
						_this.t3P = _this.t3P - 1; // 3分球次数
						break;
				}
			}
			_this.tP = _this.tP - 1;

		}
		if (_this.t1P == 0) {
			_this.t1FG = 0; // 命中率
		} else {
			_this.t1FG = _this.t1Pin / _this.t1P; // 命中率	
		}
		_this.t1FG = (_this.t1FG * 100).toFixed(2); //保留两位小数
		if (_this.t2P == 0) {
			_this.t2FG = 0; // 命中率
		} else {
			_this.t2FG = _this.t2Pin / _this.t2P; // 命中率	
		}
		_this.t2FG = (_this.t2FG * 100).toFixed(2); //保留两位小数
		if (_this.t3P == 0) {
			_this.t3FG = 0; // 命中率
		} else {
			_this.t3FG = _this.t3Pin / _this.t3P; // 命中率	
		}
		_this.t3FG = (_this.t3FG * 100).toFixed(2); //保留两位小数
		if (_this.tP == 0) {
			_this.tFG = 0; // 命中率
		} else {
			_this.tFG = _this.tPin / _this.tP; // 命中率	
		}
		_this.tFG = (_this.tFG * 100).toFixed(2); //保留两位小数
	}

	// 增加普通的技术统计，直接加减即可的。 参数：技术名称，所加数值（可正可负）
	var addNormalStatistics = function(name, addValue) {
		if ("AST" == name) {
			_this.tAST = _this.tAST + addValue;
		} else if ("TO" == name) {
			_this.tTO = _this.tTO + addValue;
		} else if ("BLK" == name) {
			_this.tBLK = _this.tBLK + addValue;
		} else if ("STL" == name) {
			_this.tSTL = _this.tSTL + addValue;
		}
	}
}

// 撤销最近的一次操作
function undo(whichSide) {
	var tsRecord;
	if (whichSide == 0) {
		tsRecord = tsRecordsHome.undoModify();
	} else {
		tsRecord = tsRecordsGuest.undoModify();
	}
	if (tsRecord != 0) {
		tsRecord.data = -tsRecord.data;
		addTS(tsRecord);
	}
}

// 添加比分
function addScore(whichSide, score2Add) {
	var tsRecord = new TSRecord();
	tsRecord.name = "POINTS";
	tsRecord.otherInfo = false;
	tsRecord.data = score2Add;
	tsRecord.whichSide = whichSide;
	tsRecord.player = 'unknown';
	// 因为加分要判断命中与否，所以将加分逻辑分成两部分
	if (isNeedRate) { // 需要统计命中率
		addScoreP1(tsRecord);
	} else { // 不需要统计命中率
		tsRecord.otherInfo = true;
		if (isNeedPersonal) { // 需要统计到个人
			showWindow_whichPlayer(tsRecord);
		} else {
			addScoreP2(tsRecord);
		}
	}
}

// 加分的第一部分逻辑（判断是否需要统计命中率）
function addScoreP1(tsRecord) {
	// 判断是否命中
	showWindow_isIn(tsRecord);
}

// 加分的第二部分逻辑
function addScoreP2(tsRecord) {
	addTS(tsRecord);
}

// 展示分数
function showScores() {
	var str;
	homescore = teamTSHome.points;
	guestscore = teamTSGuest.points;
	if (homescore < 100) {
		if (homescore < 10) {
			str = '00' + homescore;
		} else {
			str = '0' + homescore;
		}
	} else {
		str = homescore + '';
	}
	$("#homescore").html(str);
	if (guestscore < 100) {
		if (guestscore < 10) {
			str = '00' + guestscore;
		} else {
			str = '0' + guestscore;
		}
	} else {
		str = guestscore + '';
	}
	$("#guestscore").html(str);

	homeScoreCurrentSection = tsArrayHome[0].scorePerSection[currentSection - 1];
	$("#currentSectionScoreHome").html(homeScoreCurrentSection);
	guestScoreCurrentSection = tsArrayGuest[0].scorePerSection[currentSection - 1];
	$("#currentSectionScoreGuest").html(guestScoreCurrentSection);
}

// 显示判断进球的窗口
function showWindow_isIn(tsRecord) {
	var btnArray = ['进球啦', '没进哦', '按错了'];
	msg = '这是一个' + tsRecord.data + '分球！';
	mui.confirm('球进了没有啊？', msg, btnArray, function(e) {
		var isIn = false;
		if (e.index == 2 || e.index == -1) { // 按错了
			return;
		} else {
			if (e.index == 0) {
				tsRecord.otherInfo = true;
			} else if (e.index == 1) {
				tsRecord.otherInfo = false;
			}
			if (isNeedPersonal) { // 需要个人统计
				showWindow_whichPlayer(tsRecord);
			} else {
				addTS(tsRecord);
			}
		}
	});
}

// 显示是哪个运动员
function showWindow_whichPlayer(tsRecord) {
	// 找到球员列表
	var players = findWho(tsRecord.whichSide);
	initPlayerSelectPopoverHTML(players, tsRecord);
}

// 翻译技术名称
function findTechName(tsRecord) {
	var name = '';
	if (tsRecord.name == "REB") { // 篮板
		if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻篮板
			name = '进攻篮板';
		} else {
			name = '防守篮板';
		}
	} else if (tsRecord.name == "FOUL") { // 犯规
		if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻犯规
			name = '进攻犯规';
		} else {
			name = '防守犯规';
		}
	} else if (tsRecord.name == "POINTS") { // 得分
		if (isNeedRate) {
			if (tsRecord.otherInfo) {
				name = tsRecord.data + '分命中！';
			} else {
				name = tsRecord.data + '分没命中！';
			}
		} else {
			name = tsRecord.data + '分';
		}
	} else if (tsRecord.name == "AST") {
		name = '助攻1次！';
	} else if (tsRecord.name == "TO") {
		name = '失误1次！';
	} else if (tsRecord.name == "BLK") {
		name = '盖帽了！';
	} else if (tsRecord.name == "STL") {
		name = '抢断成功！';
	}
	return name;
}

// 换人的方法
function substitutePlayer(whichSide) {
	initSubstitutePlayerPopoverHTML(whichSide);
}

// 初始化弹出菜单，提供替换球员选择
function initSubstitutePlayerPopoverHTML(whichSide) {
	var teamName;
	var players;
	if (whichSide == 0) {
		players = tsArrayHome;
		teamName = tsArrayHome[0].name;
	} else {
		players = tsArrayGuest;
		teamName = tsArrayGuest[0].name;
	}
	// 找到场上的队员 和 替补队员
	var onCourt = new Array();
	var onBench = new Array();
	var indexOnCourt = 0,
		indexOnBench = 0;
	for (var i = 1; i < players.length; i++) {
		if (players[i].isOncourt == true) {
			onCourt[indexOnCourt] = players[i];
			indexOnCourt++;
		} else {
			onBench[indexOnBench] = players[i];
			indexOnBench++;
		}
	}
	// 初始化界面
	var htmlStr = '<h3 id="subTitle">' + teamName + '替换球员</h3>------场上球员------';
	var numbersColumn = 3; // 需要展示多少列
	var tableOnCourt, tableOnBench;
	tableOnCourt = '<table>';
	indexOnCourt = 0;
	for (var i = 0; i < onCourt.length; i++) {
		if ((i + 1) % numbersColumn == 1) {
			tableOnCourt = tableOnCourt + '<tr>';
		}
		tableOnCourt = tableOnCourt + '<td><div class="mui-input-row mui-checkbox mui-left">';
		if (onCourt[indexOnCourt].tFOUL == foulOutCount) {
			tableOnCourt = tableOnCourt + '<font color ="red"><label>' + onCourt[indexOnCourt].no + '</label></font>' + '</input>';
		} else {
			tableOnCourt = tableOnCourt + '<label>' + onCourt[indexOnCourt].no + '</label><input name="substitutePlayer" type="checkbox" value="' + onCourt[indexOnCourt].no + '" checked = "true" ></input>';
		}
		tableOnCourt = tableOnCourt + '</div></td>';
		if ((i + 1) % numbersColumn == 0) {
			tableOnCourt = tableOnCourt + '</tr>';
		}
		indexOnCourt++;
	}
	tableOnCourt = tableOnCourt + '</table>';
	var separate = '------板凳球员------';
	tableOnBench = '<table>';
	indexOnBench = 0;
	for (var i = 0; i < onBench.length; i++) {
		if ((i + 1) % numbersColumn == 1) {
			tableOnBench = tableOnBench + '<tr>';
		}
		tableOnBench = tableOnBench + '<td><div class="mui-input-row mui-checkbox mui-left">';
		if (onBench[indexOnBench].tFOUL == foulOutCount) {
			tableOnBench = tableOnBench + '<font color ="red"><lable>' + onBench[indexOnBench].no + '</label></font>';
		} else {
			tableOnBench = tableOnBench + '<label>' + onBench[indexOnBench].no + '</label><input name="substitutePlayer" type="checkbox" value="' + onBench[indexOnBench].no + '"></input>';
		}
		tableOnBench = tableOnBench + '</div></td>';
		if ((i + 1) % numbersColumn == 0) {
			tableOnBench = tableOnBench + '</tr>';
		}
		indexOnBench++;
	}
	tableOnBench = tableOnBench + '</table>';
	htmlStr = htmlStr + tableOnCourt + separate + tableOnBench;
	// 完成按钮
	htmlStr = htmlStr + '<button type="button" onclick="doSubstitutePlayer(' + whichSide + ')" class="mui-btn mui-btn-success">完成</button><br>';

	//	console.log("html:" + htmlStr);
	$("#myPopover").html(htmlStr);
	showORhidePopover();
}

// 真正实现换人逻辑
function doSubstitutePlayer(whichSide) {
	// 先找到一共选择了多少队员
	var selectedPlayers = $("input[name='substitutePlayer']:checked");
	var len = selectedPlayers.length;
	// 必须要满足上场人数
	if (len != playersOnCourt) {
		myAnimate($("#subTitle"), 8, "必须要保证是" + playersOnCourt + "名球员上场!", $("#subTitle").attr("style"));
		return;
	}
	// 修改球员数据统计对象的是否在场属性
	if (whichSide == 0) {
		for (var i = 1; i < tsArrayHome.length; i++) {
			if (selectedPlayers.length != 0) {
				var isFound = false;
				for (var j = 0; j < selectedPlayers.length; j++) {
					if (tsArrayHome[i].no == selectedPlayers[j].value) {
						isFound = true;
						break;
					} else {
						isFound = false;
					}
				}
				if (isFound) {
					tsArrayHome[i].isOncourt = true;
				} else {
					tsArrayHome[i].isOncourt = false;
				}
			} else {
				tsArrayHome[i].isOncourt = false;
			}
		}
	} else {
		for (var i = 1; i < tsArrayGuest.length; i++) {
			if (selectedPlayers.length != 0) {
				var isFound = false;
				for (var j = 0; j < selectedPlayers.length; j++) {
					if (tsArrayGuest[i].no == selectedPlayers[j].value) {
						isFound = true;
						break;
					} else {
						isFound = false;
					}
				}
				if (isFound) {
					tsArrayGuest[i].isOncourt = true;
				} else {
					tsArrayGuest[i].isOncourt = false;
				}
			} else {
				tsArrayGuest[i].isOncourt = false;
			}
		}
	}
	showInfoToast("换人完成");
	showORhidePopover();
}

// 初始化弹出菜单，提供选择队员
function initPlayerSelectPopoverHTML(players, tsRecord) {
	techRecord = tsRecord;
	var titleStr = '<li class="mui-table-view-cell" style="background:#ABC">' + findTechName(techRecord) + ' || 选择球员：</li>';
	var ulHead = '<ul class="mui-table-view">';
	var ulTail = '</ul>';
	var liHead = '<li class="mui-table-view-cell"><a href="#" onclick="afterPlayerSelectPopover(\'';
	var liTail = '</a></li>';
	var liCancle = '<li class="mui-table-view-cell" style="background:#CCC"><a href="#" onclick="afterPlayerSelectPopover(null)">取消</a></li>';
	var htmlStr;
	htmlStr = ulHead + titleStr;
	for (var i = 0; i < players.length; i++) {
		htmlStr += liHead + players[i] + '\')">' + players[i] + '号球员' + liTail;
	}
	htmlStr += liCancle + ulTail;
	console.log("htmlStr:" + htmlStr);
	$("#myPopover").html(htmlStr);
	showORhidePopover();
}

// 弹出菜单选择球员结束后
function afterPlayerSelectPopover(player) {
	if (player != null) {
		techRecord.player = player;
		addTS(techRecord);
	}
	showORhidePopover();
}

function showORhidePopover() {
	mui('.mui-popover').popover('toggle', document.getElementById("hoverOfPlayerSelectPopover"));
}

// 提供技术统计的归属球员，找出在场球员
function findWho(whichSide) {
	var players = new Array();
	var aa = new Array();
	// 选出whichSide在场上的人
	if (whichSide == 0) {
		aa = tsArrayHome;
	} else {
		aa = tsArrayGuest;
	}
	index = 0;
	for (var i = 0; i < aa.length; i++) {
		if (aa[i].isOncourt) {
			//players[index] = aa[i].name;
			players[index] = aa[i].no;
			index++;
		}
	}
	return players;
}

// 当比赛结束后仍然要修改数据时的提示
function confirm_forcedModify(whichSide, statname, otherInfo) {
	var msg = '比赛已经结束了，你确定要修改吗？';
	var btnArray = ['确定', '取消'];
	mui.confirm('确定？', msg, btnArray, function(e) {
		if (e.index == 1) {
			return;
		} else {
			isForceModify = true;
			addSTAT(whichSide, statname, otherInfo);
		}
	});
}

// -----比赛当中的方法-----
// 初始化数据统计
function initTSSettings() {
	currentSection = 1;
	setSectionShow(currentSection);
	$("#homename").html(teamNameHome);
	$("#guestname").html(teamNameGuest);
	setTSButtons();
	showTechnicalSes();
}

// 显示节数
function setSectionShow(currentSection) {
	if (isOvertime) {
		var t = currentSection - totalSections
		if (t > 1) {
			$("#currentSection").html("加时赛" + t);
		} else {
			$("#currentSection").html("加时赛");
		}
		return;
	}

	if (totalSections == 2) {
		if (currentSection == 1) {
			$("#currentSection").html("上半场");
		} else {
			$("#currentSection").html("下半场");
		}
	} else {
		$("#currentSection").html("第" + currentSection + "节");
	}
}

// 设置与数据统计有关的按钮
function setTSButtons() {
	if (isFreeThrow == false) { // 不需要罚球
		$("#1phome")[0].style.display = "none";
		$("#1pguest")[0].style.display = "none";
	}
}

// 是否警告犯规次数
function isWarnFoul(playerTS) {
	if (playerTS.no == 'HOME' || playerTS.no == 'GUEST') {
		return '<td>';
	}
	if (playerTS.tFOUL >= foulOutCount / 2) {
		return '<td style="color:red">';
	} else {
		return '<td>';
	}
}

// 显示数据统计
function showTechnicalSes() {
	// 展示球队包括队员的数据统计详情
	var htmlStr = '';
	if (isNeedRate == false) { // 不需要命中率
		if (isShotOnly) { // 只需要投篮技术
			htmlStr = '<tr><th>号码</th><th>得分</th><th>3分</th><th>2分</th><th>罚球</th></tr>';
		} else { // 其他技术也要
			htmlStr = '<tr><th>号码</th><th>得分</th><th>3分</th><th>2分</th><th>罚球</th><th>篮板(进攻)</th><th>盖帽</th><th>助攻</th><th>抢断</th><th>犯规(进攻)</th><th>失误</th></tr>';
		}
	} else { // 需要投篮命中率
		if (isShotOnly) { // 只需要投篮技术
			htmlStr = '<tr><th>号码</th><th>得分(%)</th><th>3分(%)</th><th>2分(%)</th><th>罚球(%)</th></tr>';
		} else { // 其他技术也要
			htmlStr = '<tr><th>号码</th><th>得分(%)</th><th>3分(%)</th><th>2分(%)</th><th>罚球(%)</th><th>篮板(进攻)</th><th>盖帽</th><th>助攻</th><th>抢断</th><th>犯规(进攻)</th><th>失误</th></tr>';
		}
	}

	// 主队
	for (var i = 0; i < tsArrayHome.length; i++) {
		if (i == 0 && tsArrayHome.length != 1) {
			htmlStr = htmlStr + '<tr bgcolor="#FF9999"><td>';
		} else {
			htmlStr = htmlStr + '<tr><td>';
		}
		var nameStr = tsArrayHome[i].no + "#" + tsArrayHome[i].name;
		if (i != 0) {
			if (nameStr.length > 5) {
				nameStr = nameStr.substr(0, 5);
			}
		} else {
			nameStr = tsArrayHome[i].no;
		}

		if (isNeedRate == false) { // 不需要命中率
			if (isShotOnly) { // 只需要投篮技术
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayHome[i].points + '</td><td>' + (tsArrayHome[i].t3Pin * 3) + '</td><td>' + (tsArrayHome[i].t2Pin * 2) + '</td><td>' + (tsArrayHome[i].t1Pin * 1) + '</td>';
			} else { // 其他技术也要
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayHome[i].points + '</td><td>' + (tsArrayHome[i].t3Pin * 3) + '</td><td>' + (tsArrayHome[i].t2Pin * 2) + '</td><td>' + (tsArrayHome[i].t1Pin * 1) + '</td><td>' + (tsArrayHome[i].tREBS) +
					'(' + tsArrayHome[i].tOREBS + ')' + '</td><td>' + (tsArrayHome[i].tBLK) + '</td><td>' +
					(tsArrayHome[i].tAST) + '</td><td>' + (tsArrayHome[i].tSTL) + '</td>' + isWarnFoul(tsArrayHome[i]) +
					(tsArrayHome[i].tFOUL) + '(' + tsArrayHome[i].tOFOUL + ')' + '</td><td>' + tsArrayHome[i].tTO + '</td></tr>';
			}
		} else { // 需要投篮命中率
			if (isShotOnly) { // 只需要投篮技术
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayHome[i].points +
					'(' + tsArrayHome[i].tFG + ')' + '</td><td>' + (tsArrayHome[i].t3Pin * 3) +
					'(' + tsArrayHome[i].t3FG + ')' + '</td><td>' + (tsArrayHome[i].t2Pin * 2) +
					'(' + tsArrayHome[i].t2FG + ')' + '</td><td>' + (tsArrayHome[i].t1Pin * 1) +
					'(' + tsArrayHome[i].t1FG + ')' + '</td>';
			} else { // 其他技术也要
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayHome[i].points +
					'(' + tsArrayHome[i].tFG + ')' + '</td><td>' + (tsArrayHome[i].t3Pin * 3) +
					'(' + tsArrayHome[i].t3FG + ')' + '</td><td>' + (tsArrayHome[i].t2Pin * 2) +
					'(' + tsArrayHome[i].t2FG + ')' + '</td><td>' + (tsArrayHome[i].t1Pin * 1) +
					'(' + tsArrayHome[i].t1FG + ')' + '</td><td>' + (tsArrayHome[i].tREBS) +
					'(' + tsArrayHome[i].tOREBS + ')' + '</td><td>' + (tsArrayHome[i].tBLK) + '</td><td>' +
					(tsArrayHome[i].tAST) + '</td><td>' + (tsArrayHome[i].tSTL) + '</td>' + isWarnFoul(tsArrayHome[i]) +
					(tsArrayHome[i].tFOUL) + '(' + tsArrayHome[i].tOFOUL + ')' + '</td><td>' + tsArrayHome[i].tTO + '</td></tr>';
			}
		}

	}
	// 客队
	for (var i = 0; i < tsArrayGuest.length; i++) {
		if (i == 0 && tsArrayGuest.length != 1) {
			htmlStr = htmlStr + '<tr bgcolor="#9999FF"><td>';
		} else {
			htmlStr = htmlStr + '<tr bgcolor="#AAAAAA"><td>';
		}

		var nameStr = tsArrayGuest[i].no + "#" + tsArrayGuest[i].name;
		if (i != 0) {
			if (nameStr.length > 5) {
				nameStr = nameStr.substr(0, 5);
			}
		} else {
			nameStr = tsArrayGuest[i].no;
		}

		if (isNeedRate == false) { // 不需要命中率
			if (isShotOnly) { // 只需要投篮技术
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayGuest[i].points + '</td><td>' + (tsArrayGuest[i].t3Pin * 3) + '</td><td>' + (tsArrayGuest[i].t2Pin * 2) + '</td><td>' + (tsArrayGuest[i].t1Pin * 1) + '</td>';
			} else { // 其他技术也要
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayGuest[i].points + '</td><td>' + (tsArrayGuest[i].t3Pin * 3) + '</td><td>' + (tsArrayGuest[i].t2Pin * 2) + '</td><td>' + (tsArrayGuest[i].t1Pin * 1) + '</td><td>' + (tsArrayGuest[i].tREBS) +
					'(' + tsArrayGuest[i].tOREBS + ')' + '</td><td>' + (tsArrayGuest[i].tBLK) + '</td><td>' +
					(tsArrayGuest[i].tAST) + '</td><td>' + (tsArrayGuest[i].tSTL) + '</td>' + isWarnFoul(tsArrayGuest[i]) +
					(tsArrayGuest[i].tFOUL) + '(' + tsArrayGuest[i].tOFOUL + ')' + '</td><td>' + tsArrayGuest[i].tTO + '</td></tr>';
			}
		} else { // 需要投篮命中率
			if (isShotOnly) { // 只需要投篮技术
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayGuest[i].points +
					'(' + tsArrayGuest[i].tFG + ')' + '</td><td>' + (tsArrayGuest[i].t3Pin * 3) +
					'(' + tsArrayGuest[i].t3FG + ')' + '</td><td>' + (tsArrayGuest[i].t2Pin * 2) +
					'(' + tsArrayGuest[i].t2FG + ')' + '</td><td>' + (tsArrayGuest[i].t1Pin * 1) +
					'(' + tsArrayGuest[i].t1FG + ')' + '</td>';
			} else { // 其他技术也要
				htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayGuest[i].points +
					'(' + tsArrayGuest[i].tFG + ')' + '</td><td>' + (tsArrayGuest[i].t3Pin * 3) +
					'(' + tsArrayGuest[i].t3FG + ')' + '</td><td>' + (tsArrayGuest[i].t2Pin * 2) +
					'(' + tsArrayGuest[i].t2FG + ')' + '</td><td>' + (tsArrayGuest[i].t1Pin * 1) +
					'(' + tsArrayGuest[i].t1FG + ')' + '</td><td>' + (tsArrayGuest[i].tREBS) +
					'(' + tsArrayGuest[i].tOREBS + ')' + '</td><td>' + (tsArrayGuest[i].tBLK) + '</td><td>' +
					(tsArrayGuest[i].tAST) + '</td><td>' + (tsArrayGuest[i].tSTL) + '</td>' + isWarnFoul(tsArrayGuest[i]) +
					(tsArrayGuest[i].tFOUL) + '(' + tsArrayGuest[i].tOFOUL + ')' + '</td><td>' + tsArrayGuest[i].tTO + '</td></tr>';
			}
		}
	}
	$("#stats").html(htmlStr);
	if (isCountFoul) {
		if (teamfoulsCurSectionHome >= foulsPersection) {
			var ss = '<h3 style="color: red;">' + teamfoulsCurSectionHome + '</h3>';
			$("#cursecFoulsHome").html(ss);
		} else {
			$("#cursecFoulsHome").html(teamfoulsCurSectionHome);
		}
		if (teamfoulsCurSectionGuest >= foulsPersection) {
			var ss = '<h3 style="color: red;">' + teamfoulsCurSectionGuest + '</h3>';
			$("#cursecFoulsGuest").html(ss);
		} else {
			$("#cursecFoulsGuest").html(teamfoulsCurSectionGuest);
		}
	} else {
		$("#FoulCountDIV").attr("style", "display:none");
	}
	showScores();
}

// 进入下一节
function nextSection() {
	currentSection = currentSection + 1;
	setSectionShow(currentSection);
	teamfoulsCurSectionHome = teamfoulsCurSectionGuest = 0;
	homeScoreCurrentSection = guestScoreCurrentSection = 0;
	$("#nextSection").attr("style", "display:none");
	setTimeControllerUI();
	showTechnicalSes();
}

// 准备进入下一节
function gotoNextSection() {
	if (currentSection < totalSections) { // 还未到全部比赛结束
		console.log("gotoNextSection");
		$("#nextSection").attr("style", "");
	} else {
		if (isNeedOvertime) {
			$("#gameCount").html("结束!");
		} else {
			$("#gameCount").html("全场结束!");
		}
		isGameEnd = true;
		readyToShareGame();
	}
}

// 不允许分享比赛
function _cantShareGame() {
	canShareGame = false;
	$("#shareGame").attr("class", "mui-btn mui-btn-primary  mui-btn-outlined  mui-pull-right");
}

// 可以分享比赛的方法
function _canShareGame() {
	canShareGame = true;
	$("#shareGame").attr("class", "mui-btn mui-btn-primary mui-pull-right");
}

// 为分享比赛前做的准备
function readyToShareGame() {
	_canShareGame();
}

// 当比赛结束后分享比赛结果
function shareGame() {
	if (canShareGame) {
		// 整理数据
		formatGameResult();
		// 上传到服务器
		// 拿到回传的结果
		// 提供分享渠道选择（微信、微博等）
	}
}

// 将技术统计结果进行整理 未完成
function formatGameResult() {
	// 将所有的技术都进行统计，仅在描述中进行区别
	var resultString = '';
	for (var i = 0; i < tsArrayHome.length; i++) {

	}
}