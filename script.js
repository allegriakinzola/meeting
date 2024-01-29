const peer = new Peer(Math.random().toString(36).substring(2, 8));

const myVideo = document.getElementById("my-video");
const theirVideo = document.getElementById("their-video");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

// Ajoutez une variable pour stocker la connexion active
let activeConnection = null;

peer.on("open", (id) => {
	console.log("My peer ID is: " + id);
	document.getElementById("meeting-id").textContent = id;
});

document.getElementById("create-meeting-btn").addEventListener("click", () => {
	const meetingID = Math.random().toString(36).substring(2, 8);
	document.getElementById("meeting-id").textContent = meetingID;
});

// Lorsque l'utilisateur clique sur le bouton "Join Meeting", récupérez l'ID de la réunion à partir du champ de saisie et connectez-vous à l'autre utilisateur avec cet ID
document.getElementById("join-meeting-btn").addEventListener("click", () => {
	const meetingID = document.getElementById("meeting-id-input").value;

	// Connectez-vous à l'autre utilisateur avec l'ID de réunion
	const conn = peer.connect(meetingID);

	// Stockez la connexion active
	activeConnection = conn;

	// Lorsque la connexion est établie, affichez un message dans la console
	conn.on("open", () => {
		console.log("Connected to meeting " + meetingID);

		// Lorsque nous recevons un message de l'autre utilisateur, affichez-le dans la boîte de chat
		conn.on("data", (data) => {
			const message = document.createElement("p");
			message.textContent = data;
			chatBox.appendChild(message);
		});

		// Lorsque l'utilisateur clique sur le bouton "Send", envoyez le message à l'autre utilisateur
		chatSendBtn.addEventListener("click", () => {
			const message = chatInput.value;
			conn.send(message);
			const messageElement = document.createElement("p");
			messageElement.textContent = "Me: " + message;
			chatBox.appendChild(messageElement);
			chatInput.value = "";
		});
	});
});

// Lorsque nous recevons un appel de l'autre utilisateur, répondez à l'appel et envoyez-leur notre flux
peer.on("call", (call) => {
	// Répondez à l'appel et envoyez-leur notre flux
	call.answer();

	// Lorsque nous recevons leur flux, définissez-le sur l'élément theirVideo
	call.on("stream", (theirStream) => {
		theirVideo.srcObject = theirStream;
	});
});

// Appelez l'autre utilisateur et envoyez-leur notre flux
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
	.then((stream) => {
		// Définissez le flux vidéo de l'utilisateur sur l'élément myVideo
		myVideo.srcObject = stream;

		// Appelez l'autre utilisateur et envoyez-leur notre flux
		const call = activeConnection.call(meetingID, stream);

		// Lorsque nous recevons leur flux, définissez-le sur l'élément theirVideo
		call.on("stream", (theirStream) => {
			theirVideo.srcObject = theirStream;
		});
	})
	.catch((error) => {
		console.log(error);
	});