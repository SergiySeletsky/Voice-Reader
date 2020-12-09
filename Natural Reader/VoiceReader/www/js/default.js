

var pageIndex = 1;
var voices = speechSynthesis.getVoices(); //Just for caching at start

setTimeout(function () {
	document.getElementById('viewerContainer').scrollTop++;
	var voiceSelect = document.getElementById("voiceSelect");
	var voices = speechSynthesis.getVoices();
	for (var i in voices) {
		var voice = voices[i];
		voiceSelect.innerHTML += '<option title="' + voice.lang + '" value="' + i + '" ' + (voice.name.indexOf("native") >= 0 ? 'selected' : '') + '>' + voice.name.replace("Google ", "") + '</option>';
	}
}, 1000);

function openingCallback() {
    stop();
    setTimeout(function () {
        document.getElementById('viewerContainer').scrollTop++;
    	try {
			//Save state here
            var settings = Windows.Storage.ApplicationData.current.roamingSettings.values;
            if (!settings["firstStart"]) {
            	document.getElementById("play").click();
                settings["firstStart"] = true;
            }
        }
        catch (ex) {
        }
    }, 1000);
}

function play() {
    document.getElementById("play").style.display = "none";
    document.getElementById("pause").style.display = "block";
    if (!started) {
    	PDFView.pdfDocument.getPage(PDFView.page).then(function (page) {

    		var map = new Map();

    		var keys = [];
    		var textDivs = document.querySelectorAll("#pageContainer" + PDFView.page + " .textLayer div");

    		for (var i in textDivs) {
    			var textDiv = textDivs[i];
    			if (textDiv != undefined && textDiv.style != undefined && textDiv.style.top != undefined && textDiv.style.top != "") {
    				var val = map.get(textDiv.style.top);
    				if (val == undefined) {
    					map.set(textDiv.style.top, [textDiv]);
    					keys.push(textDiv.style.top);
    				} else {
    					val.push(textDiv);
    				}
    			}
    		}

    		var textLayers = document.querySelectorAll(".textLayer div");
    		for (var l in textLayers)
    		{
    			if (textLayers[l].className != undefined && textLayers[l].className != "") {
    				textLayers[l].className = textLayers[l].className.replace(/\bhighlight\b/, '');
    			}
    		}

    		speek(map, keys, 0);
    		
    	});
    }
    else {
    	speechSynthesis.resume();
    }

    started = true;
}

var started = false;

function pause() {
	speechSynthesis.pause();
	document.getElementById("play").style.display = "block";
	document.getElementById("pause").style.display = "none";
}

function stop() {
    PDFView.page = 1;
    if (started) {
        started = false;
    }
    speechSynthesis.cancel();
    var textLayers = document.querySelectorAll(".textLayer div");
    for (var l in textLayers) {
    	if (textLayers[l].className != undefined && textLayers[l].className != "") {
    		textLayers[l].className = textLayers[l].className.replace(/\bhighlight\b/, '');
    	}
    }

    document.getElementById("play").style.display = "block";
    document.getElementById("pause").style.display = "none";
}

function audioSpeedSelected() {
	var rate = parseFloat(document.getElementById("audioSpeedSelect").value);
}

function voiceSelected() {
	var voice = speechSynthesis.getVoices()[parseInt(document.getElementById("voiceSelect").value)];
}

function speek(map, keys, index) {
	
	var itms = map.get(keys[index]);

	var textToSpeech = "";
	
	var textLayers = document.querySelectorAll(".textLayer div");
	for (var l in textLayers) {
		if (textLayers[l].className != undefined && textLayers[l].className != "") {
			textLayers[l].className = textLayers[l].className.replace(/\bhighlight\b/, '');
		}
	}

	for (var i in itms)
	{
		itms[i].className += ' highlight';
		textToSpeech += itms[i].innerText;
	}

	textToSpeech = textToSpeech.replace(".", " ");

    var rate = parseFloat(document.getElementById("audioSpeedSelect").value);

	// Generate the audio stream from plain text.
    var msg = new SpeechSynthesisUtterance();
    msg.voice = speechSynthesis.getVoices()[parseInt(document.getElementById("voiceSelect").value)];
    msg.volume = 1;
    msg.rate = rate;
    msg.pitch = 1;
    msg.text = textToSpeech;
    msg.lang = msg.voice.lang;
    console.log(textToSpeech);
    speechSynthesis.speak(msg);

	msg.onend = function (e) {
        //var x = parseInt(e.srcElement.id);
		if (index < keys.length) {
			speek(map, keys, index + 1);
        }
        else {
        	PDFView.page++;
        	started = false;
        	play();
        }
    };
}