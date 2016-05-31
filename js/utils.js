// 一些工具方法


// 是否载入上一次的设置
function loadLastSettings(choise) {
	if (choise) {
		return convertJsonStr(myStorageHandler_getItem("lastSettings"));
	} else {
		return;
	}
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
				reader.onloadstart = function(e){
					
				}
				reader.onloadend = function(e) { // 会了！读取文件内容用这个方法！
					try {
						data = e.target.result;
					} catch (e) {
						console.log("读取本地升级文件，数据格式错误！" + e.message);
					}
				}
				reader.readAsText(file);// 没有这个就不会调用onreadend
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
function convertJsonStr(jsonStr){
	var obj = eval("("+jsonStr+")");
	return obj;
}

