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
			//uhhh, hope they're UNIX-like
			return "\n";
		//I also hope no one is browsing on an old old Mac
		//or RISC-OS
	}
}

browser.contextMenus.create({	//contextMenus <- for chrome
	id : "download-link-list",
	title: "Make wget Download list",
	contexts: ["all"]
});//, function(){console.log("success creating!");});

browser.contextMenus.create({
	id: "all",
	title: "Get All Links",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "domain",
	title: "Get All Links on this Domain",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "images",
	title: "Get All Images",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "videos",
	title: "Get All Videos",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "audio",
	title: "Get All Audio",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "documents",
	title: "Get All Documents",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "archive",
	title: "Get All Archives/Compressed Folders",
	contexts: ["all"]
});

browser.contextMenus.create({
	id: "custom",
	title: "Custom",
	contexts: ["all"]
});

browser.contextMenus.onClicked.addListener(function(info, tab){
	let port = browser.tabs.connect(tab.id);
	switch(info.menuItemId){
		case "download-link-list":
		case "domain":
			console.log("selected!: "+tab.id);
			handleArchiveRequest("link-list", port);
			break;
		case "images":
			handleArchiveRequest("images", port);
			break;
		case "videos":
			handleArchiveRequest("videos", port);
			break;
		case "audio":
			handleArchiveRequest("audio", port);
			break;
		case "documents":
			handleArchiveRequest("documents", port);
			break;
		case "archive":
			handleArchiveRequest("archive", port);
			break;
		case "custom":
			handleArchiveRequest("custom", port);
			break;
		default:
			console.log("ERROR: Unknown/unimplemented context menu option selected!");
			break;
	}
});

browser.runtime.onMessage.addListener(function(msg){
	console.log(msg);
});

function handleArchiveRequest(action, port){
	

	port.postMessage({
		"action": action,
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


