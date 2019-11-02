var mainScrollBox;
var buttonTable;

function setButtonData(sender)
{
}

function loadTableData(thisTable, thisData)
{
	console.log(thisData);
	var th = document.getElementById(buttonTable.id + "_head");
	var tb = document.getElementById(buttonTable.id + "_body");
	var numCols = th.childNodes[0].children.length;

	createDataTableLines(thisTable, [tfPos,tfNumeric,tfInpTypeSel,tfNumeric], thisData.length, "");
	console.log(thisTable.id);	
	for (var i=0; i<thisData.length;i++)
	{
		var e = document.getElementById(thisTable.id + "_" + i.toString() + "_" + "1");
		e.childNodes[0].value = thisData[i].ButtonNr;
		var e = document.getElementById(thisTable.id + "_" + i.toString() + "_" + "2");
		e.childNodes[0].value = 1;
		var e = document.getElementById(thisTable.id + "_" + i.toString() + "_" + "3");
		e.childNodes[0].value = thisData[i].CtrlCmd[0].CmdList[0].CtrlTarget;
	}
}


function constructFooterContent(footerTab)
{
	var tempObj;
	tempObj = createEmptyDiv(footerTab, "div", "tile-1_4", "footerstatsdiv1");
		createDispText(tempObj, "", "Date / Time", "n/a", "sysdatetime");
		createDispText(tempObj, "", "System Uptime", "n/a", "uptime");
	tempObj = createEmptyDiv(footerTab, "div", "tile-1_4", "footerstatsdiv2");
		createDispText(tempObj, "", "IP Address", "n/a", "IPID");
		createDispText(tempObj, "", "Signal Strength", "n/a", "SigStrengthID");
	tempObj = createEmptyDiv(footerTab, "div", "tile-1_4", "footerstatsdiv3");
		createDispText(tempObj, "", "Firmware Version", "n/a", "firmware");
		createDispText(tempObj, "", "Available Memory", "n/a", "heapavail");
}

function constructPageContent(contentTab)
{
	var tempObj;
	mainScrollBox = createEmptyDiv(contentTab, "div", "pagetopicboxscroll-y", "nodeconfigdiv");
		createPageTitle(mainScrollBox, "div", "tile-1", "BasicCfg_Title", "h1", "Button Handler Configuration");
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
		buttonTable = createDataTable(mainScrollBox, "tile-1_4", ["Pos","Button #", "Button Event", "Button Command"], "btnconfig", "setButtonData(this)");
		
		
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createEmptyDiv(tempObj, "div", "tile-1_4", "");
			createButton(tempObj, "tile-1_4", "Save & Restart", "btnSave", "saveSettings(this)");
			createButton(tempObj, "tile-1_4", "Cancel", "btnCancel", "cancelSettings(this)");
		
}

function processStatsData(jsonData)
{
	writeTextField("sysdatetime", jsonData.systime);
	writeTextField("uptime", formatTime(Math.trunc(jsonData.uptime/1000)));
	writeTextField("IPID", jsonData.ipaddress);
	writeTextField("SigStrengthID", jsonData.sigstrength + " dBm");
	writeTextField("firmware", jsonData.version);
	writeTextField("heapavail", jsonData.freemem + " Bytes");
}

function loadDataFields(jsonData)
{
	loadTableData(buttonTable, jsonData.ButtonHandler);
}
