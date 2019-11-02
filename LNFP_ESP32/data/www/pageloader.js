var systemTime = new Date();
var serverIP = "ws://" + location.hostname + "/ws";  
var ws = null; // = new WebSocket(serverIP);
//var loadedScripts = [];
var scriptList;
var currentPage = 0;

var configLoadData;
var configWorkData;

function loadPageList(pageName, menueTab, contentTab, footerTab)
{
    var request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if (this.readyState == 4) 
		{
			if (this.status == 200) 
			{
				scriptList = JSON.parse(this.response);
//				console.log(scriptList, scriptList.Pages.length);
				for (i=0; i<scriptList.Pages.length;i++)
				{
//					console.log("Loading Page", pageName, scriptList.Pages[i].WebPage );
					if (scriptList.Pages[i].WebPage == pageName)
					{
//						console.log("Setting ID", pageName, scriptList.Pages[i].ID );
						currentPage = i; //scriptList.Pages[i].ID;
						createMenueTabElement(menueTab, "button", "tablink", scriptList.Pages[i].ID, scriptList.Pages[i].Menue, "");
					}
					else
						createMenueTabElement(menueTab, "button", "tablink", scriptList.Pages[i].ID, scriptList.Pages[i].Menue, "loadPage('" + scriptList.Pages[i].WebPage+ "')");
						
				}
				updateMenueTabs(scriptList.Pages[currentPage].ID, "grey");
				constructPageContent(contentTab);
				constructFooterContent(footerTab);
			}
		}
	}
	request.open("GET", "pageconfig.json", true);
	request.setRequestHeader('Cache-Control', 'no-cache');
	request.send();
}

function updateMenueTabs(pageID, color) 
{
	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < tablinks.length; i++) 
	{
//		console.log(tablinks[i].id, pageID);
		if (tablinks[i].id == pageID)
			tablinks[i].style.backgroundColor = color;
		else
			tablinks[i].style.backgroundColor = "";
	}
}

function loadPage(pageURL)
{
	window.location.href = pageURL;
}

function saveSettings(sender)
{
	var configStr = "{\"Cmd\":\"CfgUpdate\", \"Type\":\"" + scriptList.Pages[currentPage].ID + "\", \"Data\":" + JSON.stringify(configWorkData)  + "}";
	ws.send(configStr);
	setTimeout(function(){ startWebsockets() }, 500);
	alert("Save configuration and restart device");
//	location.reload();
}

function cancelSettings(sender)
{
	configWorkData = JSON.parse(JSON.stringify(configLoadData));
	loadDataFields(configWorkData);
}

function startWebsockets()
{
//	document.addEventListener("visibilitychange", handleVisibilityChange, false);
//	console.log("init websockets");
	ws = new WebSocket(serverIP);
	  
    ws.onopen = function() 
    {
//		console.log("Page Open", scriptList.Pages[currentPage].ID);	
//		console.log("{\"Cmd\":\"CfgData\", \"Type\":\"" + scriptList.Pages[currentPage].ID + "\"}");	
		ws.send("{\"Cmd\":\"CfgData\", \"Type\":\"" + scriptList.Pages[currentPage].ID + "\"}");
    };
 
	ws.onclose = function (evt) 
	{
		console.log("websock close");
		setTimeout(startWebsockets, 3000);
//		conStatusError();
	};

	ws.onerror = function (evt) 
	{
		console.log(evt);
//		  conStatusError();
	};

    ws.onmessage = function(evt) 
    {
//		console.log(evt.data);
  		var myArr = JSON.parse(evt.data);
  		if (myArr.Cmd == "STATS")
  		{
			console.log(JSON.stringify(myArr.Data));
			processStatsData(myArr.Data);
		}
  		if ((myArr.Cmd == "LN") && (scriptList.Pages[currentPage].ID == "pgNodeCfg"))
			console.log(JSON.stringify(myArr.Data));
  		if ((myArr.Cmd == "DCC") && (scriptList.Pages[currentPage].ID == "pgNodeCfg"))
			console.log(JSON.stringify(myArr.Data));
  		if (myArr.Cmd == "CfgData")
  		{
			configLoadData = JSON.parse(JSON.stringify(myArr.Data));
			configWorkData = JSON.parse(JSON.stringify(myArr.Data));
			loadDataFields(configLoadData);
		}
	}
};

