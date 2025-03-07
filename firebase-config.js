// Your Firebase project configuration
// Replace these values with your own Firebase project details
const firebaseConfig = {
  apiKey: "AIzaSyDVbt_8GuRuHJRPAN7jFXbs_lJUfUHNxHE",
  authDomain: "chummy-games.firebaseapp.com",
  databaseURL: "https://chummy-games-default-rtdb.firebaseio.com",
  projectId: "chummy-games",
  storageBucket: "chummy-games.firebasestorage.app",
  messagingSenderId: "869241598273",
  appId: "1:869241598273:web:d97492b7308f785c37f1c0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
