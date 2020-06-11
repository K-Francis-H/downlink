//get platform info for newlines
let platformInfo;
browser.runtime.getPlatformInfo().then(function(info){
	platformInfo = info;
});

function osNewLineType(os){
	switch(os){
		case "mac":
		case "android":
		case "cros":
		case "linux":
		case "openbsd":
			return "\n";
		case "win":
			return "\r\n";
		default:
			//uhhh, hope they're POSIX compliant
			return "\n";
	}
}

browser.contextMenus.create({	//contextMenus <- for chrome
	id : "download-link-list",
	title: "Make wget Download list",
	contexts: ["all"]
}, function(){console.log("success creating!");});

browser.contextMenus.onClicked.addListener(function(info, tab){
	switch(info.menuItemId){
		case "download-link-list":
			console.log("selected!: "+tab.id);
			let id = tab.id;
			//ask tab for list of links
			let port = browser.tabs.connect(tab.id);
			handleArchiveRequest(port);
			break;
	}
});

browser.runtime.onMessage.addListener(function(msg){
	console.log(msg);
});

function handleArchiveRequest(port){
	

	port.postMessage({
		"action":"link-list",
		"newline": osNewLineType(platformInfo.PlatformOs)
	});
}

/*
browser.menus.create({
	id : "download-link-list",
	title: "Make wget Download list",
	contexts: ["all"]
}
*/


