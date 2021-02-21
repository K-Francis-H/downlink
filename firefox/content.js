const HOST = document.location.host;
const PATH = document.location.pathname;
//const BASE_URI = document.location.baseURI; //protocol://host/path
const ORIGIN = document.location.origin;

const DOMAIN_REGEX = new RegExp("^"+ORIGIN+".+", "g");
const IMAGES_REGEX = /\.(gif|jpe?g|tiff|png|webp|bmp|ico|svg|ai|eps)$/i
const VIDEOS_REGEX = /\.(mp4|m4p|m4v|mpg|webm|avi|wmv|mov|qt|flv|swf|mkv)$/i
const AUDIO_REGEX = /\.(mp3|wav|wma|ogg|flac|midi?|m4a|pcast|mpa|aiff?|caf)$/i
const DOCUMENT_REGEX = /\.(docx?|xlsx?|pdf|mobi|epub|awz|txt|rtf|odt)$/i
const ZIP_REGEX = /\.(zip|7z|rar|tar|tar\.gz|gzip|bz2|gz|s7z)$/i //probably way more of these

//go thru links and add to the context menu an option to make a wget list, or download all links on current domain, probably pop a menu

console.log("content.js on: "+ORIGIN+PATH);

//let port = browser.runtime.connect();


browser.runtime.onConnect.addListener(function(port){
	port.onMessage.addListener(function(msg){
		console.log("msg recieved: "+JSON.stringify(msg));
		//alert("msg recieved");
		//only one type currently so make link list
		let regex = DOMAIN_REGEX;
		let all = "";
		switch(msg.action){
			case "domain":
				all += generateLinkList(DOMAIN_REGEX, msg.newline);
				break;
			case "images":
				all += generateLinkList(IMAGES_REGEX, msg.newline);
				all += getImageSources(msg.newline);
				break;
			case "videos":
				all += generateLinkList(VIDEOS_REGEX, msg.newline);
				all += getMediaSources("VIDEO", msg.newline);
				break;
			case "audio":
				all += generateLinkList(AUDIO_REGEX, msg.newline);
				all += getMediaSources("AUDIO", msg.newline);
				break;
			case "documents":
				all += generateLinkList(DOCUMENT_REGEX, msg.newline);
				break;
			case "archives":
				all += generateLinkList(ZIP_REGEX, msg.newline);
				break;
			case "custom":
				let customRegex = prompt("Enter Custom Regex")
				console.log(customRegex)
				console.log(customRegex !== null)
				re = new RegExp(customRegex, 'g');
				console.log(re);
				//if(customRegex !== null && customRegex !== undefined){
					all += fullBodySearch(re, msg.newline);
				//}else{
				//	return;
				//}
				console.log(fullBodySearch(customRegex, msg.newline));
				console.log(all);
				break;
			default:
				//TODO
				return;
				break;
		}
		port.postMessage(msg);
		//generateLinkList(regex, msg.newline);

		//reorder functions to create list in memory, concat with others, combine here and offer download
		createTextDownload(all);
	});
	console.log("connection recieved!");
});

function fullBodySearch(pattern, newline){
	console.log("fullBodySearch(): "+pattern);
	let matches = document.body.innerHTML.match(pattern);
	console.log(matches);
	/*let list = "";
	for(let i=0; i < matches.length; i++){
		list += matches[i]+newLine;
	}*/
	return matches.join(newline) + newline; //last newline so using cat works to combine later
}


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

	//getMediaSources("AUDIO", newline);
	//getMediaSources("VIDEO");

	//createTextDownload(list);

	return list;
}


function createTextDownload(content){
	var a = document.createElement("A");
	a.href = window.URL.createObjectURL(new Blob([content]), {type: "text/plain;charset=utf-8"});
	a.download = HOST+"_wget_list.txt";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function getMediaSources(tagName, newline){
	let tags = document.getElementsByTagName(tagName);
	let sources = [];
	let links = "";

	console.log(tags);
	for(let i=0; i < tags.length; i++){
		//sources.concat(tags[i].children);
		let ch = tags[i].children;
		for(let j=0; j < ch.length; j++){
			if(ch[j].tagName === "SOURCE"){
				console.log(ch[j].src);
				links += ch[j].src + newline;
			}
		}
	}
	return links;
}

function getImageSources(newline){
	let imgs = document.getElementsByTagName("IMG");
	let links = "";
	
	for(let i=0; i < imgs.length; i++){
		links += imgs[i].src + newline;
	}
	return links;
}
/*
function getAudioSources(){
	let audioTags = document.getElementsByTagName("AUDIO");
	//TODO some may be in frames as well
	let sources = 	
}

function getVideoSources(){
	let videoTags = document.getElementsByTagName("VIDEO");
	//TODO may be in frames as well
}

*/
