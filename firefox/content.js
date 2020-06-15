const HOST = document.location.host;
const PATH = document.location.pathname;
//const BASE_URI = document.location.baseURI; //protocol://host/path
const ORIGIN = document.location.origin;

const DOMAIN_REGEX = new RegExp("^"+ORIGIN+".+", "g");
const IMAGES_REGEX = /\.(gif|jpe?g|tiff|png|webp|bmp|ico|svg|ai|eps)$/i
const VIDEOS_REGEX = /\.(mp4|m4p|m4v|mpg|webm|avi|wmv|mov|qt|flv|swf)$/i
const AUDIO_REGEX = /\.(mp3|wav|wma|ogg|flac|midi?|m4a|pcast|mpa|aiff?)$/i
const DOCUMENT_REGEX = /\.(docx?|xlsx?|pdf|mobi|epub|awz|txt|rtf|odt)$/i

//go thru links and add to the context menu an option to make a wget list, or download all links on current domain, probably pop a menu

console.log("content,js on: "+ORIGIN+PATH);

//let port = browser.runtime.connect();


browser.runtime.onConnect.addListener(function(port){
	port.onMessage.addListener(function(msg){
		console.log("msg recieved: "+JSON.stringify(msg));
		//alert("msg recieved");
		//only one type currently so make link list
		let regex = DOMAIN_REGEX;
		switch(msg.action){
			case "domain":
				regex = DOMAIN_REGEX;
				break;
			case "images":
				regex = IMAGES_REGEX;
				break;
			case "videos":
				regex = VIDEOS_REGEX;
				break;
			case "audio":
				regex = AUDIO_REGEX;
				break;
			case "documents":
				regex = DOCUMENT_REGEX;
				break;
			case "custom":
			default:
				//TODO
				break;
		}
		port.postMessage(msg);
		generateLinkList(regex, msg.newline);
	});
	console.log("connection recieved!");
});


//newline param for win vs unix like systems
//TODO let people manually set these if they prefer as wel as the autodetect
//TODO allow search of selected text/html instead of whole page
function generateLinkList(pattern, newline){
	let links = document.getElementsByTagName("A");
	let list = "";
	let hmap = {}; //hashmap to help remove duplicate links

	//let pattern = new RegExp("^"+ORIGIN+PATH+".+", "g"); //href contains but is not equal to the baseURI
		//NOTE the above only works for hierarchical websites, if thepaths do not follow a hierarchy, then this will fail
	let patternAlt = new RegExp("^"+ORIGIN+".+", "g"); //works on non-hierarchical paths, may cause infinite loop. to prevent have bg.js keep a hash of all seen links for this page and do not revisit any.
	console.log(pattern);


	for(let i=0; i < links.length; i++){
		let link = links[i].href;
		
		console.log(link.match(pattern));
		if(link.match(pattern)){
			hmap[link] = link;
			//list += link+"\n"; //TODO make Windows compatible based on host OS, macos uses \n now i think
		}
	}
	//now use hmap to remove dupes
	let uniqueLinks = Object.keys(hmap);
	for(let i=0; i < uniqueLinks.length; i++){
		list += uniqueLinks[i]+newline;
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


