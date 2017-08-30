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

firebase.initializeApp(config);


// Create a variable to reference the database.
var database = firebase.database();
var employeeRef = database.ref("/trainData");

var trainName, trainDest, trainStart, trainFreq;



// Add train

$("#addTrain").on("click", function(event) {
	event.preventDefault();
	
	trainName = $("#nameInput").val().trim();
	trainDest = $("#destInput").val().trim();
	trainStart = moment($("#startInput").val().trim(), "HH:mm");
	trainFreq = $("#freqInput").val().trim();
	
	console.log("trainName is " + trainName);
	console.log("trainDest is " + trainDest);
	console.log("trainStart is " + moment(trainStart).format("HH:mm"));
	console.log("trainFreq is " + trainFreq);

	$("#nameInput").val("");
	$("#destInput").val("");
	$("#startInput").val("");
	$("#freqInput").val("");

	database.ref("/trainData").push({
		tName: trainName,
		tDest: trainDest,
		tFreq: trainFreq,
		tStart: moment(trainStart).format("HH:mm"),
		tNext: 5, //moment calculation here;
		tAway: 10 //moment calculation here;
	});

});

employeeRef.on("child_added", function(childSnapshot) {
	console.log("I got activated");

	$('#trainTable tbody').append(
		"<tr><td>" + childSnapshot.val().tName + "</td>" +
		"<td>" + childSnapshot.val().tDest + "</td>" +
		"<td>" + childSnapshot.val().tFreq + "</td>" +
		"<td>" + childSnapshot.val().tNext + "</td>" +
		"<td>" + childSnapshot.val().tAway + "</td>" +
		"</tr>");	
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});