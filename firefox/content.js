const HOST = document.location.host;
const PATH = document.location.pathname;
//const BASE_URI = document.location.baseURI; //protocol://host/path
const ORIGIN = document.location.origin;


//go thru links and add to the context menu an option to make a wget list, or download all links on current domain, probably pop a menu

console.log("content,js on: "+ORIGIN+PATH);

//let port = browser.runtime.connect();


browser.runtime.onConnect.addListener(function(port){
	port.onMessage.addListener(function(msg){
		console.log("msg recieved: "+JSON.stringify(msg));
		//alert("msg recieved");
		//only one type currently so make link list
		port.postMessage(msg);
		generateLinkList(msg.newline);
	});
	console.log("connection recieved!");
});


//newline param for win vs unix like systems
//TODO let people manually set these if they prefer as wel as the autodetect
function generateLinkList(newline){
	let links = document.getElementsByTagName("A");
	let list = "";
	let hmap = {}; //hashmap to help remove duplicate links

	let pattern = new RegExp("^"+ORIGIN+PATH+".+", "g"); //href contains but is not equal to the baseURI
		//NOTE the above only works for hierarchical websites, if thepaths do not follow a hierarchy, then this will fail
	let patternAlt = new RegExp("^"+ORIGIN+".+", "g"); //works on non-hierarchical paths, may cause infinite loop. to prevent have bg.js keep a hash of all seen links for this page and do not revisit any.
	console.log(patternAlt);


	for(let i=0; i < links.length; i++){
		let link = links[i].href;
		
		console.log(link.match(patternAlt));
		if(link.match(patternAlt)){
			hmap[link] = link;
			//list += link+"\n"; //TODO make Windows compatible based on host OS, macos uses \n now i think
		}
	}
	//now use hmap to remove dupes
	let uniqueLinks = Object.keys(hmap);
	for(let i=0; i < uniqueLinks.length; i++){
		list += uniqueLinks[i]+newline; //TODO think of the windows users
	}

	createTextDownload(list);
}


function createTextDownload(content){
	var a = document.createElement("A");
	a.href = window.URL.createObjectURL(new Blob([content]), {type: "text/plain;charset=utf-8"});
	a.download = HOST+"_wget_list.txt";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}


