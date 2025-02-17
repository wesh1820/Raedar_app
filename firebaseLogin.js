// firebaseLogin.js
import { auth } from './firebaseConfig';  // Import the auth object from your firebase config
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase login method

// Example function to log in a user and get the ID token
const loginUser = async (email, password) => {
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get the Firebase ID token
    const idToken = await user.getIdToken();

    // Send the ID token to your backend to authenticate the user
    const response = await fetch('https://your-server-url.com/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),  // Send the ID token in the request body
    });

    const data = await response.json();
    console.log('Backend response:', data);

    // Continue with your app logic after successful login
  } catch (error) {
    console.error('Error during login:', error.message);
  }
};

// Example usage: login with email and password
loginUser('user@example.com', 'password123');
