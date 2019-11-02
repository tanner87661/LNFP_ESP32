var mainScrollBox;
var buttonTable;

function setThreshold(sender)
{
}

function setNumButtons(sender)
{
}

function setButtonData(sender)
{
}

function loadTableData(thisTable, thisData)
{
	function selByName(prmVal)
	{
		switch (prmVal)
		{
			case "off" : return 0;
			case "digital" : return 1;
			case "touch" : return 2;
			case "analog" : return 3;
		}
	}
	
	var th = document.getElementById(buttonTable.id + "_head");
	var tb = document.getElementById(buttonTable.id + "_body");
	var numCols = th.childNodes[0].children.length;

	createDataTableLines(thisTable, [tfPos,tfText,tfInpTypeSel,tfNumeric], thisData.length, "");	
	for (var i=0; i<thisData.length;i++)
	{
		var portNr = thisData[i].PortNr;
		var e = document.getElementById(thisTable.id + "_" + portNr.toString() + "_" + "2");
		e.childNodes[0].selectedIndex = selByName(thisData[i].ButtonType);
		var e = document.getElementById(thisTable.id + "_" + portNr.toString() + "_" + "3");
		e.childNodes[0].value = thisData[i].ButtonAddr;
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
	mainScrollBox = createEmptyDiv(contentTab, "div", "pagetopicboxscroll-y", "btnconfigdiv");
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h1", "Hardware Button Setup");
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h2", "Basic Settings");
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createTextInput(tempObj, "tile-1_4", "Hold Threshold (ms)", "n/a", "holdthreshold", "setThreshold(this)");
			createTextInput(tempObj, "tile-1_4", "Dbl Clk Threshold (ms)", "n/a", "dblclkthreshold", "setThreshold(this)");
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "wificb");
			createTextInput(tempObj, "tile-1_4", "Board Base Address", "n/a", "baseaddress", "setThreshold(this)");
			createTextInput(tempObj, "tile-1_4", "# of Buttons used", "n/a", "numbuttons", "setNumButtons(this)");
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h2", "Button Configuration");

		buttonTable = createDataTable(mainScrollBox, "tile-1_4", ["Pos","Port #", "Button Type", "Button Address"], "btnconfig", "setButtonData(this)");


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
	writeInputField("holdthreshold", jsonData.HoldThreshold);
	writeInputField("dblclkthreshold", jsonData.DblClickThreshold);
	writeInputField("baseaddress", jsonData.BoardBaseAddr);
	writeInputField("numbuttons", jsonData.Buttons.length);
	loadTableData(buttonTable, jsonData.Buttons);
}
