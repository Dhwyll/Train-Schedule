// Initialize Firebase
// Make sure to match the configuration to the script version number in the HTML
// (Ex. 3.0 != 3.7.0)		 
var config = {
	apiKey: "AIzaSyCkdqplkBHCOLknnGXsESkNcK-RdwegZig",
	authDomain: "my-first-project-cbc.firebaseapp.com",
	databaseURL: "https://my-first-project-cbc.firebaseio.com",
	projectId: "my-first-project-cbc",
	storageBucket: "",
	messagingSenderId: "886865820846"
};

firebase.initializeApp(config);											// Initialize the App


// Create a variable to reference the database.
var database = firebase.database();
var trainRef = database.ref("/trainData");

// Create variables to be used
var trainName, trainDest, trainStart, trainFreq;						// These are the variables from the form
var rightNow, timeBetween, minutesDiff, nextMinutesDiff;					// These will be used to manage the time calculations
																		// rightNow is the current time
																		// timeBetween is the amount of minutes between now and the start of the train in either direction
																		// minutesDiff is timeBetween converted to minutes
																		// nextMinutesDiff is the number of minutes in the future of the next train
// Add train

$("#addTrain").on("click", function(event) {							// When the user adds a train
	event.preventDefault();												// Prevent the default action of that Submit button
	
	trainName = $("#nameInput").val().trim();							// Get trainName from the form
	trainDest = $("#destInput").val().trim();							// Get trainDest from the form
	trainStart = moment($("#startInput").val().trim(), "HH:mm");		// Get trainStart from the form and convert to HH:mm format
	trainFreq = $("#freqInput").val().trim();							// Get trainFreq from the form
	
	$("#nameInput").val("");											// Clear the form entries
	$("#destInput").val("");
	$("#startInput").val("");
	$("#freqInput").val("");
	
	rightNow = moment(new Date(), "HH:mm");								// What time is it right now?
	timeBetween = moment.duration(rightNow.diff(trainStart));				// How much time between right now and when the train starts
	minutesDiff = parseInt(timeBetween.asMinutes());						// Convert the timeBetween to minutes.
	if (minutesDiff === 0) {											// If the train is leaving right now...
		trainNext = "Right Now";												// Then set trainNext to "Right Now"...
		trainAway = 0;															// Which is 0 minutes away.
	}
		else if (minutesDiff < 0) {										// Otherwise, if the trains starts in the future...
			trainNext = moment(trainStart).format("HH:mm");						// Then set tNext to the start time of the train...
			trainAway = parseInt(timeBetween.asMinutes()) * -1 + 1;				// Reverse polarity of timeBetween adding 1 to account for 0 minutes and set tAway.
		}
			else {															// Otherwise, the train starts in the past
				nextMinutesDiff = trainFreq - (minutesDiff % trainFreq);	// Get the remainder of minutes given the frequency of the train
				if (nextMinutesDiff === trainFreq) {						// If the train is leaving right now...
					trainNext = "Right Now";									// Then set trainNext to "Right Now"...
					trainAway = 0;												// Which is 0 minutes away.
				}
					else {
						trainNext = moment(rightNow).add(nextMinutesDiff, "minutes").format("HH:mm");		// Set tNext to now + nextMinutesDiff
						trainAway = nextMinutesDiff;														// And set tAway to nextMinutesDiff
					}
			}

	database.ref("/trainData").push({									// Push the values to the database
		tName: trainName,
		tDest: trainDest,
		tFreq: trainFreq,
		tStart: moment(trainStart).format("HH:mm"),						// convert the trainStart time to HH:mm format...for future development
		tNext: trainNext,
		tAway: trainAway
	});

});

trainRef.on("child_added", function(childSnapshot) {					// When the database gets a new train
	var childKey = childSnapshot.key;
	$('#trainTable tbody').append(										// Append to the tbody of the trainTable
		"<tr><td>" + childSnapshot.val().tName + "</td>" +				// The various variables from the database in their own cells
		"<td>" + childSnapshot.val().tDest + "</td>" +
		"<td>" + childSnapshot.val().tFreq + "</td>" +
		"<td id='"+childKey+"Next'>" + childSnapshot.val().tNext + "</td>" +
		"<td id='"+childKey+"Away'>" + childSnapshot.val().tAway + "</td>" +
		"</tr>");
}, function(errorObject) {												// Unless there is an error.
	console.log("Errors handled: " + errorObject.code);
});


setInterval(function(){
	trainRef.on('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			var childKey = childSnapshot.key;
			var updateData;
			var updates = {};
			
			trainStart = moment(childData.tStart, "HH:mm");
			trainFreq = childData.tFreq;

			rightNow = moment(new Date(), "HH:mm");								// What time is it right now?
			timeBetween = moment.duration(rightNow.diff(trainStart));			// How much time between right now and when the train starts
			minutesDiff = parseInt(timeBetween.asMinutes());						// Convert the timeBetween to minutes.
			if (minutesDiff === 0) {											// If the train is leaving right now...
				trainNext = "Right Now";												// Then set trainNext to "Right Now"...
				trainAway = 0;															// Which is 0 minutes away.
			}
				else if (minutesDiff < 0) {										// Otherwise, if the trains starts in the future...
					trainNext = moment(trainStart).format("HH:mm");						// Then set tNext to the start time of the train...
					trainAway = parseInt(timeBetween.asMinutes()) * -1 + 1;				// Reverse polarity of timeBetween adding 1 to account for 0 minutes and set tAway.
				}
					else {															// Otherwise, the train starts in the past
						nextMinutesDiff = trainFreq - (minutesDiff % trainFreq);	// Get the remainder of minutes given the frequency of the train
						if (nextMinutesDiff === trainFreq) {						// If the train is leaving right now...
							trainNext = "Right Now";									// Then set trainNext to "Right Now"...
							trainAway = 0;												// Which is 0 minutes away.
						}
							else {
								trainNext = moment(rightNow).add(nextMinutesDiff, "minutes").format("HH:mm");		// Set tNext to now + nextMinutesDiff
								trainAway = nextMinutesDiff;														// And set tAway to nextMinutesDiff
							}
					}

			updateData = {tAway: trainAway,
						  tDest: childData.tDest,
						  tFreq: childData.tFreq,
						  tName: childData.tName,
						  tNext: trainNext,
						  tStart: childData.tStart};
			updates['/' + childKey] = updateData;
			trainRef.update(updates);
			$("#"+childKey+"Next").html(childData.tNext);
			$("#"+childKey+"Away").html(childData.tAway);
		});
	});

}, 5000);