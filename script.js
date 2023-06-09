// Create a new Peer object with a random ID
const peer = new Peer(Math.random().toString(36).substring(2, 8), {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' },
    { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
  ]} /* Sample servers, please use appropriate ones */);

// Get the video elements from the HTML
const myVideo = document.getElementById("my-video");
const theirVideo = document.getElementById("their-video");

// When the Peer object has an ID assigned to it, log the ID to the console and display it on the page
peer.on("open", (id) => {
	console.log("My peer ID is: " + id);
	document.getElementById("meeting-id").textContent = id;
});

// When the user clicks the "Create Meeting" button, generate a new ID and set it as the meeting ID
document.getElementById("create-meeting-btn").addEventListener("click", () => {
	const meetingID = Math.random().toString(36).substring(2, 8);
	document.getElementById("meeting-id").textContent = meetingID;
});

// When the user clicks the "Join Meeting" button, get the meeting ID from the input field and connect to the other user with that ID
document.getElementById("join-meeting-btn").addEventListener("click", () => {
	const meetingID = document.getElementById("meeting-id-input").value;

	// Connect to the other user with the meeting ID
	const conn = peer.connect(meetingID);

	// When the connection is established, log a message to the console
	conn.on("open", () => {
		console.log("Connected to meeting " + meetingID);
	});

	// When we receive a call from the other user, answer the call and send them our stream
	peer.on("call", (call) => {
		call.answer();

		// When we receive their stream, set it to the theirVideo element
		call.on("stream", (theirStream) => {
			theirVideo.srcObject = theirStream;
		});
	});

	// Call the other user and send them our stream
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then((stream) => {
			// Set the user's video stream to the myVideo element
			myVideo.srcObject = stream;

			const call = peer.call(meetingID, stream);

			// When we receive their stream, set it to the theirVideo element
			call.on("stream", (theirStream) => {
				theirVideo.srcObject = theirStream;
			});
		})
		.catch((error) => {
			console.log(error);
		});
});