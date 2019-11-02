var mainScrollBox;

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
		createPageTitle(mainScrollBox, "div", "tile-1", "BasicCfg_Title", "h1", "LED Chain Configuration");
	tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
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
}
