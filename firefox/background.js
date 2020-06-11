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
	port.postMessage({"action":"link-list"});
}

/*
browser.menus.create({
	id : "download-link-list",
	title: "Make wget Download list",
	contexts: ["all"]
}
*/


