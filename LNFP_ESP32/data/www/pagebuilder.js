function createMenueTabElement(parentObj, objType, className, objID, objTitle, clickFct)
{
	var docElement = document.createElement(objType);
	docElement.setAttribute('class', className);	
	docElement.setAttribute("id", objID);
	docElement.setAttribute("name", objTitle);
	docElement.setAttribute("onclick", clickFct);
	
	if (docElement.childNodes[0])
    {
        docElement.childNodes[0].nodeValue=objTitle;
    }
    else if (docElement.value)
    {
        docElement.value=objTitle;
    }
    else //if (button.innerHTML)
    {
        docElement.innerHTML=objTitle;
    }	
	parentObj.append(docElement);
	return docElement;
}

function createPageTitle(parentObj, objType, className, objID, titleGrade, objTitle)
{
	var docElement = document.createElement(objType);
	docElement.setAttribute('class', className);	
	docElement.setAttribute("id", objID);
	docElement.setAttribute("name", objTitle);
	objTitle = "<" + titleGrade + ">" + objTitle + "</" + titleGrade + ">";
	if (docElement.childNodes[0])
    {
        docElement.childNodes[0].nodeValue=objTitle;
    }
    else if (docElement.value)
    {
        docElement.value=objTitle;
    }
    else //if (button.innerHTML)
    {
        docElement.innerHTML=objTitle;
    }	
	parentObj.append(docElement);
	return docElement;
}

function createEmptyDiv(parentObj, objType, className, objID)
{
	var docElement = document.createElement(objType);
	docElement.setAttribute('class', className);	
	docElement.setAttribute("id", objID);
	parentObj.append(docElement);
	return docElement;
}

function createDispText(parentObj, divclass, labelText, dispText, dispObjID)
{
	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var textElement = document.createElement("div");
	textElement.setAttribute('class', "inputtext_tab1");
	textElement.append(document.createTextNode(labelText));
	textDiv.append(textElement);
	
	var dispElement = document.createElement("div");
	dispElement.setAttribute('class', "inputtext_tab2");
	dispElement.setAttribute('id', dispObjID);
	dispElement.append(document.createTextNode(dispText));
	textDiv.append(dispElement);
	return textDiv;
}

function createCheckbox(parentObj, divclass, labelText, cbObjID, onclick)
{
	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var cbElement = document.createElement("input");
	cbElement.setAttribute("type", "checkbox");
	cbElement.setAttribute("id", cbObjID);
	cbElement.setAttribute('class', "checkbox");
	cbElement.setAttribute("onclick", onclick);
	textDiv.append(cbElement);
	
	var textElement = document.createElement("span");
	textElement.setAttribute('class', "checkboxtext");
	textElement.append(document.createTextNode(labelText));
	textDiv.append(textElement);
	return textDiv;
}

function createRadiobox(parentObj, divclass, labelText, optionText, cbObjID, onclick)
{
	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var textElement = document.createElement("span");
	textElement.setAttribute('class', "checkboxtext");
	textElement.append(document.createTextNode(labelText));
	textDiv.append(textElement);

	for (var i=0; i<optionText.length; i++)
	{
		var cbElement = document.createElement("input");
		cbElement.setAttribute("type", "radio");
		cbElement.setAttribute("id", cbObjID + "_" + i.toString());
		cbElement.setAttribute("name", cbObjID);
		cbElement.setAttribute('class', "radiobutton");
		cbElement.setAttribute("onclick", onclick);

		var textElement = document.createElement("span");
		textElement.setAttribute('class', "checkboxtext");
		textElement.append(document.createTextNode(optionText[i]));
		textDiv.append(cbElement);
		textDiv.append(textElement);
	}
	return textDiv;
}

function createOptions(dropdownlist, optionText)
{
	while (dropdownlist.length > 0)
		dropdownlist.remove(0);
	for (var i=0; i<optionText.length;i++)
	{
		if (optionText[i] != "")
		{
			var option = document.createElement("option");
			option.value = i;
			option.text = optionText[i];
			dropdownlist.appendChild(option);
		}
	}
}

function getDropdownValue(dropdown_id)
{
	var e = document.getElementById(dropdown_id);
	if (e.selectedIndex >= 0)
		return e.options[e.selectedIndex].value;
	else
		return -1;
}

function setDropdownValue(dropdown_id, newValue)
{
	var e = document.getElementById(dropdown_id);
	for (var i=0; i<e.options.length;i++)
		if (e.options[i].value == newValue)
		{
			e.selectedIndex = i;
			return;
		}
	e.selectedIndex = -1;
}

function createDropdownselector(parentObj, divclass, labelText, optionText, selObjID, onChange)
{

	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var textElement = document.createElement("span");
	textElement.setAttribute('class', "checkboxtext");
	textElement.append(document.createTextNode(labelText));
	textDiv.append(textElement);

	var selectList = document.createElement("select");
	selectList.setAttribute("id", selObjID);
	selectList.setAttribute("name", selObjID);
	selectList.setAttribute("onchange", onChange);
	createOptions(selectList, optionText);
	textDiv.append(selectList);
}

function createTextInput(parentObj, divclass, labelText, inputText, cbObjID, onchange)
{
	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var textElement = document.createElement("div");
	textElement.setAttribute('class', "inputtext_tab1");
	textElement.append(document.createTextNode(labelText));
	textDiv.append(textElement);

	var inpElement = document.createElement("input");
	inpElement.setAttribute("type", "numinputshort");
	inpElement.setAttribute("id", cbObjID);
	inpElement.setAttribute("onchange", onchange);
	inpElement.value = inputText;
	textDiv.append(inpElement);
}

function createButton(parentObj, divclass, labelText, btnObjID, onclick)
{
	var textDiv = document.createElement("div");
	textDiv.setAttribute('class', divclass);
	parentObj.append(textDiv);

	var thisButton = document.createElement("button");
	thisButton.setAttribute("id", btnObjID);
	thisButton.setAttribute("onclick", onclick);
	thisButton.setAttribute('class', 'mod-button');
	textDiv.append(thisButton);
	var textElement = document.createTextNode(labelText);
	thisButton.append(textElement);
	
}

function createDataTable(parentObj, divclass, colHeaders, baseObjId, onchange) //table function for button configuration
{
	var tableDiv = document.createElement("div");
	tableDiv.setAttribute('class', divclass);
//	tableDiv.setAttribute("cmdList", onchange);
	parentObj.append(tableDiv);
	
	var tt = document.createElement("table");
	tt.setAttribute("class", "table");
	tt.setAttribute("id", baseObjId);
	var th = document.createElement("thead");
	th.setAttribute("id", baseObjId + "_head");
	tt.append(th);
	var tb = document.createElement("tbody");
	tb.setAttribute("id", baseObjId + "_body");
	tt.append(tb);
	var tf = document.createElement("tfoot");
	tt.append(tf);

	var newRow = document.createElement("tr");
	newRow.setAttribute("class", "th");
	th.append(newRow);

	for (var i=0; i < colHeaders.length; i++)
	{
		console.log(colHeaders[i]);
		var newCol = document.createElement("td");
		newCol.setAttribute("id", baseObjId + "_h_" + i.toString());
		var newRB = document.createTextNode(colHeaders[i]);
		newCol.append(newRB);
		newRow.append(newCol);
	}
	tableDiv.append(tt);
	return tt;
}

function tfPos(i)
{
	var newRB = tfText(i+1);
	return newRB;
}

function tfText(i)
{
	var newRB = document.createTextNode(i.toString());
	return newRB;
}

function tfInpTypeSel(i)
{
	
	var selectList = document.createElement("select");
	createOptions(selectList, ["Btn Down","Btn Up","Click","Btn Hold", "Btn Dbl Click", "Analog"]);
	return selectList;
}

function tfBtnEvtSel(i)
{
	
	var selectList = document.createElement("select");
	createOptions(selectList, ["Off","Digital","Touch","Analog"]);
	return selectList;
}

function tfNumeric(i)
{
	var inpElement = document.createElement("input");
	inpElement.setAttribute("type", "numinputshort");
	return inpElement;
}

function createDataTableLines(tableObj, colLoaders, numLines, onchange)
{
	var th = document.getElementById(tableObj.id + "_head");
	var tb = document.getElementById(tableObj.id + "_body");
	var numCols = th.childNodes[0].children.length;
	while (tb.hasChildNodes())
		tb.removeChild(tb.childNodes[0]); //delete rows
	for (var i=0; i < numLines; i++)
	{
		var newRow = document.createElement("tr");
		newRow.setAttribute("class", "th");
		tb.append(newRow);
		for (var j=0; j < numCols; j++)
		{
			var newCol = document.createElement("td");
			newCol.setAttribute("id", tableObj.id + "_" + i.toString() + "_" + j.toString());
			newRow.append(newCol);
			var newRB = colLoaders[j](i);
			newCol.append(newRB);
		}
	}
}

function enableInput(senderstatus, target)
{
	document.getElementById(target).disabled = !senderstatus;
}

function setVisibility(senderstatus, target, reverse)
{
	if (senderstatus ^ reverse)
		target.style.display = "block";
	else
		target.style.display = "none";
}

function readNumInputField(thisObjID)
{
	var thisField = document.getElementById(thisObjID);
	return verifyNumber(thisField.value, 0);
}

function verifyNumber(inpValue, defValue)
{
	var numVal;
	if (isNaN(inpValue))
	{
		alert(inpValue + " is not a valid number. Please verify");
		return defValue;	
	}
	else
		return parseInt(inpValue);
}

function writeInputField(thisObjID, newValue)
{
//	console.log(typeof(newValue), newValue);
	var thisField = document.getElementById(thisObjID);
	if (typeof(newValue) == "number")
		thisField.value = newValue.toString();
	else
		thisField.value = newValue;
}

function readTextInputToArray(thisObjID, minLen, maxLen)
{
	var readVal = readTextInputField(thisObjID);
	var newVal = readVal.split(',');
	var intVal = [];
	for (var i=0; i<newVal.length; i++)
	  if ((newVal[i] != "") && !isNaN(newVal[i]))
		intVal.push(parseInt(newVal[i]));
	if (((intVal.length >= minLen) && (intVal.length <= maxLen)) && (intVal.length == newVal.length))
		return intVal;
	else
	{
		alert(readVal + " is not a correct comma separated array. Please verify");
		return -1;
	}
}

function readTextInputField(thisObjID)
{
	var thisField = document.getElementById(thisObjID);
	return thisField.value;
}

function readCBInputField(thisObjID)
{
	var thisField = document.getElementById(thisObjID);
	return thisField.checked;
}

function writeCBInputField(thisObjID, newValue)
{
	var thisField = document.getElementById(thisObjID);
	thisField.checked = newValue;
}

function writeRBInputField(thisObjID, newValue)
{
	var thisField = document.getElementById(thisObjID + "_" + newValue.toString());
	if (thisField != null)
		thisField.checked = true;
}

function writeTextField(thisObjID, newValue)
{
	var thisField = document.getElementById(thisObjID);
	if (thisField != null)
		thisField.innerHTML = newValue;
}

function formatTime(seconds) {
    return [
        parseInt(seconds / 60 / 60),
        parseInt(seconds / 60 % 60),
        parseInt(seconds % 60)
    ]
        .join(":")
        .replace(/\b(\d)\b/g, "0$1")
}
