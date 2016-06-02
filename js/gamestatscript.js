// 比赛中数据统计的脚本
// 根据用户初始设定的环境变量
var gameType; // 比赛类型
var isNeed24s = false; // 是否需要记录24秒
var totalSections; // 比赛总节数
var gameCount = "time";// 比赛结束记录方式，时间或者分数
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
// 技术统计变量
var teamTSHome, teamTSGuest;
var tsArrayHome = new Array();
var tsArrayGuest = new Array();

var playerCountsHome = 0,
	playerCountsGuest = 0,
	playerCountsMax = 0;

var teamNameHome, teamNameGuest; // 队伍显示的名字	
var teamCodeHome, teamCodeGuest; // 队伍代码	

// 参与计算的变量
var gamet = 1 * 60 * 1000; // 用来计算的比赛时间
var st_m_gamet = '0'; // 比赛时间分钟
var st_s_gamet = '0'; // 比赛时间秒数
var st_off = '0'; // 展示进攻时间限制
var offensivet = 24; // 进攻限制时间
var lastGameTime; // 上一次计时起点
var lastOffTime; // 上一次进攻计时起点
var gametime_distance = 0; // 与上一次比赛时间计时起点的差值
var offtime_distance = 0; // 与上一次进攻时间计时起点的差值
var gametimeleft; // 剩余比赛时间
var isTimeup = false; // 是否到时间
var isGameEnd = false; // 是否比赛结束
var isForceModify = false; // 是否强行修改技术统计（比赛结束后仍然修改）
var showMin = true; // 是否显示分钟
var pause = false; // 是否暂停
var needOffensivetime = true; // 是否需要进攻时限
var off_t = 24 * 1000; // 进攻时限
var offtimeleft; // 剩余进攻时限时间
var st_off = '00s'; // 用于展示的进攻时限
var isOffTimeup = false; // 进攻时限是否到时间
var homescore = 0,
	guestscore = 0; // 主、客队计分；
var tsRecordsHome = new TSRecordsController(); // 加分的记录，主队
var tsRecordsGuest = new TSRecordsController(); // 加分的记录，客队
var techRecord;// 临时记录数据统计的全局变量，避开传值
var teamfoulsCurSectionHome = 0,
	teamfoulsCurSectionGuest = 0;
var isOvertime = false;

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
	isNeed24s = statOptions.isNeed24s;
	if (isNeed24s == false) {
		$("#24sShow1").html('');
		$("#24sShow2").html('');
	}
	isNeedOvertime = statOptions.isNeedOvertime;
	isNeedRate = statOptions.isNeedRate;
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
	playersOnCourt = gameRules.playersOnCourt;
	foulOutCount = gameRules.foulOutCount;
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
	teamTSHome = new PlayerTechStats(teamCodeHome, null, teamNameHome);
	teamTSGuest = new PlayerTechStats(teamCodeGuest, null, teamNameGuest);
	tsArrayHome[0] = teamTSHome;
	tsArrayGuest[0] = teamTSGuest;
}

// 设置球员信息
function initPlayersInfos(playersInfos) {
	console.log("initPlayersInfos");
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
	}
}

// 初始化其他变量
function initOtherVariables() {

}

// 比较大小的工具方法
function toolMax(a, b) {
	if (a > b) {
		return a;
	} else {
		return b;
	}
}

// 倒计时更新
function show_time() {
	if (pause == true) {
		return;
	}
	// 计算与上一次计时起点的差值
	calculateCha();
	// 计算剩余时间
	gametimeleft = gamet - gametime_distance;
	if (gametimeleft > 0) {
		// 计算剩余分钟
		var tm = Math.floor(gametimeleft / (1000 * 60));
		//				console.log("tm:" + tm);
		if (tm < 10) {
			st_m_gamet = '0' + tm;
		} else {
			st_m_gamet = tm;
		}
		if (tm == 0) {
			showMin = false;
		} else {
			showMin = true;
		}
		// 计算剩余的秒数
		var ts = (gametimeleft % (1000 * 60)) / 1000;
		//		console.log("ts:" + ts);
		if (ts == 00) {
			st_s_gamet = '00';
		} else if (ts < 10) { // 秒数小于10s
			if (tm == 0) { // 不需要显示分钟
				st_s_gamet = ('' + ts).substr(0, 3) + 's';
			} else { // 需要显示分钟
				st_s_gamet = ('0' + ts).substr(0, 2);
			}
		} else { // 秒数大于10s
			if (tm == 0) { // 不需要显示分钟
				st_s_gamet = ('' + ts).substr(0, 4) + 's';
			} else { // 需要显示分钟
				st_s_gamet = ('' + ts).substr(0, 2);
			}
		}
		if (needOffensivetime) {
			offtimeleft = off_t - offtime_distance;
			// 计算剩余的秒数
			var ots = (offtimeleft % (1000 * 60)) / 1000;
			if (ots <= 0) {
				st_off = '00s';
				isOffTimeup = true;
			} else if (ots < 10) {
				if (ots < 6) { // 需要展示毫秒
					st_off = ('0' + ots).substr(0, 4) + 's';
				} else {
					st_off = ('0' + ots).substr(0, 2) + 's';
				}
			} else {
				st_off = ('' + ots).substr(0, 2) + 's';
			}
		}
		// 设置时间显示
		setShowTime();
		if (tm == 0 || offtimeleft < 10000) {
			setTimeout("show_time()", 100);
		} else {
			setTimeout("show_time()", 500);
		}
	} else {
		isTimeup = true;
		setShowTime();
	}
}

// 显示时间
function setShowTime() {
	if (isOffTimeup == true) {
		$("#offensivetime").html("00.0s");
	} else {
		$("#offensivetime").html(st_off);
	}
	if (isTimeup == true) {
		if (currentSection < totalSections) { // 还未到全部比赛结束
			$("#gametime").html("时间到！");
			$("#nextSection")[0].style.display = 'block';

		} else {
			if (homescore == guestscore && isNeedOvertime == true) { // 需要加时赛
				isOvertime = true;
				$("#nextSection")[0].style.display = 'block';
				$("#nextSection").html('加时赛');
			} else {
				$("#gametime").html("全场时间到！");
				isGameEnd = true;
			}
		}
		$("#controlgameTime")[0].style.display = 'none';
	} else {
		if (showMin == false) {
			$("#gametime").html(st_s_gamet);
		} else {
			$("#gametime").html(st_m_gamet + ":" + st_s_gamet);
		}
	}
}

function setLastGameTime() { // 设定比赛时间上次计时起点
	lastGameTime = new Date().getTime(); //设定当前时间
}

function setLastOffTime() { // 设定进攻时间上次计时起点
	lastOffTime = new Date().getTime(); //设定当前时间
}

function calculateCha() {
	var now = new Date().getTime();
	gametime_distance = now - lastGameTime;
	offtime_distance = now - lastOffTime;
}
// 计时开始入口方法
function controlGameTime() {
	var aa = $("#controlgameTime").html();
	if (aa == '开始') {
		$("#controlgameTime").html('暂停');
		pause = false;
		if (gametime_distance != 0) { // 原来已经走过的时间不为零，需要修改下一次倒计时时长
			gamet = gamet - gametime_distance;
		}
		setLastGameTime();
		if (offtime_distance != 0) { // 原来已经走过的时间不为零，需要修改下一次倒计时时长
			off_t = off_t - offtime_distance;
		}
		setLastOffTime();
		show_time();
	} else if (aa == '暂停') {
		pause = true;
		$("#controlgameTime").html('开始');
	}
}

function reset24s() {
	setLastOffTime();
	offtime_distance = 0;
	$("#offensivetime").html('24s');
	off_t = 24 * 1000;
	isOffTimeup = false;
}

function reset14s() {
	setLastOffTime();
	offtime_distance = 0;
	$("#offensivetime").html('14s');
	off_t = 14 * 1000;
	isOffTimeup = false;
}

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
	if (tsRecord.player != "unknown") { // 需要添加到个人
		var obj = findTSPlayer(tsArray, tsRecord.player);
		if (obj != "notFound") {
			obj.addStatistics(tsRecord);
		}
	}
	setTSes();
}

// 根据球员名字在传进来的队列中寻找并返回该球员的技术统计对象
function findTSPlayer(tsArray, player) {
	for (var i = 0; i < tsArray.length; i++) {
		if (tsArray[i].no == player) {
			console.log("find player:" + tsArray[i].no);
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
	_this.scorePerSection = new Array(); // 每节得分

	// 增加技术统计 参数：技术名称，所加数值（可正可负）, 其他信息
	this.addStatistics = function(tsRecord) {
		console.log("addTS whichSide:" + tsRecord.whichSide + "; player:" + tsRecord.player + "; data:" + tsRecord.data + "; otherInfo:" + tsRecord.otherInfo);

		if (tsRecord.name == "REB") { // 篮板
			_this.tREBS = _this.tREBS + tsRecord.data;
			if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻篮板
				_this.tOREBS = _this.tOREBS + tsRecord.data;
			}
		} else if (tsRecord.name == "FOUL") { // 犯规
			if (_this.name == "HOME") { // 球队需要统计本节犯规累计
				teamfoulsCurSectionHome = teamfoulsCurSectionHome + tsRecord.data;
			} else if (_this.name == "GUEST") {
				teamfoulsCurSectionGuest = teamfoulsCurSectionGuest + tsRecord.data;
			}
			_this.tFOUL = _this.tFOUL + tsRecord.data;
			if (tsRecord.otherInfo == "OFFENSIVE") { // 进攻犯规
				_this.tOFOUL = _this.tOFOUL + tsRecord.data;
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
				_this.scorePerSection[currentSection - 1] = _this.scorePerSection[currentSection] + score; // 添加本节得分
				_this.tP = _this.tP + 1;
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
				_this.tP = _this.tP + 1;
			}
		} else { // 撤销得分
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
			_this.points = _this.points + score;
			_this.scorePerSection[currentSection - 1] = _this.scorePerSection[currentSection] + score; // 添加本节得分
			_this.tP = _this.tP - 1;
			_this.tPin = _this.tPin - 1;
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

// 统计比分
function addScore(whichSide, score2Add) {
	var tsRecord = new TSRecord();
	tsRecord.name = "POINTS";
	tsRecord.otherInfo = false;
	tsRecord.data = score2Add;
	tsRecord.whichSide = whichSide;
	tsRecord.owner = 'unknown';
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
}

// 显示判断进球的窗口
function showWindow_isIn(tsRecord) {
	var btnArray = ['进球啦', '没进哦', '按错了'];
	msg = '这是一个' + tsRecord.data + '分球！';
	mui.confirm('球进了没有啊？', msg, btnArray, function(e) {
		var isIn = false;
		if (e.index == 2) { // 按错了
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
	initPopoverHTML(players, tsRecord);
}


// 初始化弹出菜单，提供选择队员
function initPopoverHTML(players, tsRecord) {
	techRecord = tsRecord;
	var titleStr = '<li class="mui-table-view-cell" style="background:#ABC">选择是哪一名球员：</li>';
	var ulHead = '<ul class="mui-table-view">';
	var ulTail = '</ul>';
	var liHead = '<li class="mui-table-view-cell"><a href="#" onclick="afterSelectPopover(\'';
	var liTail = '</a></li>';
	var liCancle = '<li class="mui-table-view-cell" style="background:#CCC"><a href="#" onclick="afterSelectPopover(null)">取消</a></li>';
	var htmlStr;
	htmlStr = ulHead + titleStr;
	for (var i = 0; i < players.length; i++) {
		htmlStr += liHead + players[i] + '\')">' + players[i] + '号球员' + liTail;
	}
	htmlStr += liCancle + ulTail;
	console.log("htmlStr:" + htmlStr);
	$("#popover").html(htmlStr);
	mui('.mui-popover').popover('toggle', document.getElementById("otherTech"));
}

// 弹出菜单选择球员结束后
function afterSelectPopover(player) {
	if (player != null) {
		techRecord.player = player;
		addTS(techRecord);
	}
	mui('.mui-popover').popover('toggle', document.getElementById("otherTech"));
}

// 判断是谁做的
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
//			players[index] = aa[i].name;
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
	setGameTimeShow(gameCountPerSection + ":00");
	setTimeCount(gameCountPerSection);
	$("#homename").html(teamNameHome);
	$("#guestname").html(teamNameGuest);
	setTSButtons();
	setTSes();
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

// 显示比赛时间字符串
function setGameTimeShow(timeStr) {
	$("#gametime").html(timeStr);
	if (isNeed24s == false) {
		$("#24sShow1")[0].style.display = 'none';
		$("#24sShow2")[0].style.display = 'none';
	} else {
		$("#offensivetime").html("24s");
	}
}

// 设置比赛计时变量
function setTimeCount(timeInMin) {
	gamet = 1 * 60 * 1000 * timeInMin;
	gametime_distance = 0;
	if (isNeed24s) {
		off_t = 24 * 1000;
		isOffTimeup = false;
		offtime_distance = 0;
	}
	isTimeup = false;
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
	if (playerTS.name == 'HOME' || playerTS.name == 'GUEST') {
		return '<td>';
	}

	if (playerTS.tFOUL >= 4) {
		return '<td style="color:red">';
	} else {
		return '<td>';
	}
}

// 显示数据统计
function setTSes() {
	// 展示球队包括队员的数据统计详情
	var htmlStr = '<tr><th>号码</th><th>得分(%)</th><th>3分(%)</th><th>2分(%)</th><th>罚球(%)</th><th>篮板(进攻)</th><th>盖帽</th><th>助攻</th><th>抢断</th><th>犯规(进攻)</th><th>失误</th></tr>';
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
			nameStr = tsArrayHome[i].name;
		}

		htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayHome[i].points +
			'(' + tsArrayHome[i].tFG + ')' + '</td><td>' + (tsArrayHome[i].t3Pin * 3) +
			'(' + tsArrayHome[i].t3FG + ')' + '</td><td>' + (tsArrayHome[i].t2Pin * 2) +
			'(' + tsArrayHome[i].t2FG + ')' + '</td><td>' + (tsArrayHome[i].t1Pin * 1) +
			'(' + tsArrayHome[i].t1FG + ')' + '</td><td>' + (tsArrayHome[i].tREBS) +
			'(' + tsArrayHome[i].tOREBS + ')' + '</td><td>' + (tsArrayHome[i].tBLK) + '</td><td>' +
			(tsArrayHome[i].tAST) + '</td><td>' + (tsArrayHome[i].tSTL) + '</td>' + isWarnFoul(tsArrayHome[i]) +
			(tsArrayHome[i].tFOUL) + '(' + tsArrayHome[i].tOFOUL + ')' + '</td><td>' + tsArrayHome[i].tTO + '</td></tr>';
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
			nameStr = tsArrayGuest[i].name;
		}

		htmlStr = htmlStr + nameStr + '</td><td>' + tsArrayGuest[i].points +
			'(' + tsArrayGuest[i].tFG + ')' + '</td><td>' + (tsArrayGuest[i].t3Pin * 3) +
			'(' + tsArrayGuest[i].t3FG + ')' + '</td><td>' + (tsArrayGuest[i].t2Pin * 2) +
			'(' + tsArrayGuest[i].t2FG + ')' + '</td><td>' + (tsArrayGuest[i].t1Pin * 1) +
			'(' + tsArrayGuest[i].t1FG + ')' + '</td><td>' + (tsArrayGuest[i].tREBS) +
			'(' + tsArrayGuest[i].tOREBS + ')' + '</td><td>' + (tsArrayGuest[i].tBLK) + '</td><td>' +
			(tsArrayGuest[i].tAST) + '</td><td>' + (tsArrayGuest[i].tSTL) + '</td>' + isWarnFoul(tsArrayGuest[i]) +
			(tsArrayGuest[i].tFOUL) + '(' + tsArrayGuest[i].tOFOUL + ')' + '</td><td>' + tsArrayGuest[i].tTO + '</td></tr>';
	}
	$("#stats").html(htmlStr);
	if (teamfoulsCurSectionHome >= 4) {
		var ss = '<h3 style="color: red;">' + teamfoulsCurSectionHome + '</h3>';
		$("#cursecFoulsHome").html(ss);
	} else {
		$("#cursecFoulsHome").html(teamfoulsCurSectionHome);
	}
	if (teamfoulsCurSectionGuest >= 4) {
		var ss = '<h3 style="color: red;">' + teamfoulsCurSectionGuest + '</h3>';
		$("#cursecFoulsGuest").html(ss);
	} else {
		$("#cursecFoulsGuest").html(teamfoulsCurSectionGuest);
	}
	showScores();
}

// 进入下一节
function nextSection() {
	currentSection = currentSection + 1;
	setSectionShow(currentSection);
	if (isOvertime) {
		setTimeCount(gameCountOvertime);
		setGameTimeShow(gameCountOvertime + ":00");
	} else {
		setTimeCount(gameCountPerSection);
		setGameTimeShow(gameCountPerSection + ":00");
	}
	teamfoulsCurSectionHome = teamfoulsCurSectionGuest = 0;
	$("#nextSection")[0].style.display = 'none';
	$("#controlgameTime")[0].style.display = '';
	$("#controlgameTime").html('开始');
	setTSes();
}