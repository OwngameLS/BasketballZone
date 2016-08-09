// 一些工具方法

// 读取设置
function loadSettings(settingsName) {
	//	console.log("myStorageHandler_getItem(settingsName):" + myStorageHandler_getItem(settingsName));
	return convertJsonStr(myStorageHandler_getItem(settingsName));
}

// h5+ storage操作 ：写入数据库
function myStorageHandler_setItem(key, value) {
	plus.storage.setItem(key, value);
	//	console.log("setItem,Key:" + key +",value:" + value);
}

// h5+ storage操作：读数据库内容
function myStorageHandler_getItem(key) {
	//	console.log("getItem,Key:" + key +",value:" + plus.storage.getItem(key));
	return plus.storage.getItem(key);
}

// 写文件
function writeFile(dirPath, filePath, content) { // 目录，文件路径， 文件内容
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, function(fs) { // 这个方法的参数决定了下面的操作
		//	参数分别有：
		//fs: ( FileSystem ) 必选 请求到的文件系统对象
		//entry: ( DirectoryEntry ) 必选 请求到的目录或文件对象
		//metadata: ( Metadata ) 必选 文件或目录的状态信息
		//entrys: ( DirectoryEntry ) 必选 文件或目录对象数组
		//writer: ( FileWriter ) 必选 写文件对象的引用
		//file: ( File ) 必选 文件数据对象的引用
		fs.root.getFile(filePath, {
			create: true
		}, function(fileEntry) {
			//			console.log(fileEntry.fullPath);
			fileEntry.createWriter(function(writer) {
				writer.onwrite = function(e) {
					console.log("Write data success!");
				};
				writer.write(content);
			})
		}, function(e) {
			alert("getFile failed:" + e.message);
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}

// 读取文件内容
function readFileContent(dirPath, filePath) {
	var data = null;
	plus.io.requestFileSystem(dirPath, function(fs) { // 这个方法的参数决定了下面的操作
		fs.root.getFile(filePath, {
			create: false
		}, function(fileEntry) {
			var ff = fileEntry.file(function(file) {
				console.log("File size: " + file.size);
				var reader = new plus.io.FileReader();
				reader.onloadstart = function(e) {

				}
				reader.onloadend = function(e) { // 会了！读取文件内容用这个方法！
					try {
						data = e.target.result;
					} catch(e) {
						console.log("读取本地升级文件，数据格式错误！" + e.message);
					}
				}
				reader.readAsText(file); // 没有这个就不会调用onreadend
				// 这样理解吧，这个方法调用后，系统会在它上面找过程中触发事件对应的回调方法
			}, function(e) {
				alert(e.message);
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
	console.log("data:" + data);
	return data;
}

// 将Json字符串内容转换成JsonObject
function convertJsonStr(jsonStr) {
	var obj = eval("(" + jsonStr + ")");
	return obj;
}

// 判断是不是大于0的整数
function isInteger(obj) {
	var o = Math.floor(obj);
	if(o == obj) { // ==== 就不行
		if(o >= 0) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
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

// 播放声音，传入音频文件
function playSound(name) {
	if(name == 'timeup') {
		name = "timeup.wav";
	}
	var filePath = 'audio/' + name;
	var player = plus.audio.createPlayer(filePath);
	player.play();
}

// 比较大小的工具方法
function toolMax(a, b) {
	var aa = parseInt(a);
	var bb = parseInt(b);
	if(aa > bb) {
		return aa;
	} else {
		return bb;
	}
}

// 初始化一个定长数组
function initArrayWithLength(length) {
	var a = new Array();
	for(var i = 0; i < length; i++) {
		a[i] = 0;
	}
	return a;
}

function testAAjax() {
	console.log("worinige!");
	// 测试ajax 和服务器
	var saveData = '{"playerBasicInfos":{"id":1,"curTeamid":1,"historyTeams":"1","age":27,"birthday":"1988-08-31","resume":"no","name":"LongSheng","sex":"m","jersyno":"27","height":178.0,"weight":74.0,"armspan":183.0,"position":"PG","games":5,"mvp":1,"prides":"no","statid":1,"iconimg":"no","grade":"d"},"playerCareerStats":{"id":1,"fga":5,"fgm":3,"fg":60.0,"pa3":5,"pm3":3,"fg3":60.0,"pa2":0,"pm2":0,"fg2":0.0,"pa1":0,"pm1":0,"fg1":0.0,"rebs":10,"orebs":8,"blks":2,"fouls":3,"ofouls":1,"stls":2,"asts":5,"tos":0,"totalScore":15}}';
	mui.ajax({
		type: "post",
		dataType: "json",
		url: "http://192.168.1.103:8080/BasketballZoneService/playerinfos/test3",
		contentType:"application/json",
		data: JSON.stringify(saveData),
		complete: function() {

		},
		success: function(data) {
			console.log("现在接收到的data是：" + data);
		}
	});
}