// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

            setTimeout(function () {
                document.getElementById('viewerContainer').scrollTop++;
                var voiceSelect = document.getElementById("voiceSelect");
                var voices = Windows.Media.SpeechSynthesis.SpeechSynthesizer.allVoices;
                for (var i = 0; i < voices.size; i++) {
                	var voice = voices[i];
                	voiceSelect.innerHTML += '<option title="' + voice.description + '" value="' + i + '" ' + (voice.displayName.indexOf("Zira") >= 0 ? 'selected' : '') + '>' +
                        (voice.displayName.indexOf("Zira") >= 0 ? 'Zira' : (voice.displayName.indexOf("David") >= 0 ? 'David' : (voice.displayName.indexOf("Hazel") >= 0 ? 'Hazel' : voice.displayName))) + '</option>';
                }
                document.getElementById("sidebarToggle").click();
            }, 1000);

        }
        if (args.detail.kind === activation.ActivationKind.file) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                //DEFAULT_URL = 'file:///' + args.detail.files[0].path.replace(/\\/g, "/");
                //setTimeout(function () {
                //    try {
                //        //PDFView.open('file:///' + args.detail.files[0].path.replace(/\\/g, "/"));
                //        DEFAULT_URL = 'file:///' + args.detail.files[0].path.replace(/\\/g, "/");
                //    }
                //    catch (ex) {
                //        $('body').text(JSON.stringify(ex));
                //    }

                //}, 2000);

                //

            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();

})();

var pageIndex = 1;

var synth = new Windows.Media.SpeechSynthesis.SpeechSynthesizer();
var a = new Audio();

function openingCallback() {
    stop();
    setTimeout(function () {
        document.getElementById('viewerContainer').scrollTop++;
        try {
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
        a.play();
    }

    started = true;
}

var started = false;

function pause() {
	a.pause();
	document.getElementById("play").style.display = "block";
	document.getElementById("pause").style.display = "none";
}

function stop() {
    PDFView.page = 1;
    if (started) {
        started = false;
    }
    a.pause();
    
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
	a.playbackRate = parseFloat(document.getElementById("audioSpeedSelect").value);
}

function voiceSelected() {
	synth.voice = Windows.Media.SpeechSynthesis.SpeechSynthesizer.allVoices[parseInt(document.getElementById("voiceSelect").value)];
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

    a = new Audio();
    var rate = parseFloat(document.getElementById("audioSpeedSelect").value);
    a.defaultPlaybackRate = rate;
    a.playbackRate = rate;

    //a.id = index;
    a.autobuffer = true;
    a.msRealTime = true;

    a.playbackRate = rate;

    synth.voice = Windows.Media.SpeechSynthesis.SpeechSynthesizer.allVoices[parseInt(document.getElementById("voiceSelect").value)];
    // Generate the audio stream from plain text.
    synth.synthesizeTextToStreamAsync(textToSpeech).then(function (markersStream) {

        // Convert the stream to a URL Blob.
        var blob = MSApp.createBlobFromRandomAccessStream(markersStream.ContentType, markersStream);

        // Send the Blob to the audio object.
        a.src = URL.createObjectURL(blob, { oneTimeOnly: true });
        a.play();
        a.playbackRate = rate;
    });

    var next = function (e) {
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
    a.addEventListener('ended', next, true);
    a.addEventListener('error', next, true); 
}