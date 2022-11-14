// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const time = document.getElementById('time');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

async function main() {
  // Add Firebase project configuration object here
  const firebaseConfig = {
    apiKey: 'AIzaSyAXsagRI9KhvYYitAtEgek1gCFIijxqSjg',
    authDomain: 'mytasks-6fc88.firebaseapp.com',
    projectId: 'mytasks-6fc88',
    storageBucket: 'mytasks-6fc88.appspot.com',
    messagingSenderId: '124827804348',
    appId: '1:124827804348:web:8dcc211510d911b56aa6b9',
  };

  // Make sure Firebase is initilized
  try {
    if (firebaseConfig && firebaseConfig.apiKey) {
      initializeApp(firebaseConfig);
    }
    db = getFirestore();
    auth = getAuth();
  } catch (e) {
    console.log('error:', e);
    document.getElementById('app').innerHTML =
      '<h1>Welcome to the Codelab! Add your Firebase config object to <pre>/index.js</pre> and refresh to get started</h1>';
    throw new Error(
      'Welcome to the Codelab! Add your Firebase config object from the Firebase Console to `/index.js` and refresh to get started'
    );
  }

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };

  const ui = new firebaseui.auth.AuthUI(getAuth());

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is signed in; allows user to sign out
      signOut(auth);
    } else {
      // No user is signed in; allows user to sign in
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  // Listen to the current Auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      // Show guestbook to logged-in users
      guestbookContainer.style.display = 'block';
    } else {
      startRsvpButton.textContent = 'RSVP';
      // Hide guestbook for non-logged-in users
      guestbookContainer.style.display = 'none';
    }
  });

  // Listen to the form submission
  form.addEventListener('submit', async (e) => {
    // Prevent the default form redirect
    e.preventDefault();
    // Write a new message to the database collection "guestbook"
    var x = addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      time: time.value,
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
    });
    x.then((res) => {
      console.log('Added doc..', res);
    }).catch((e) => {
      console.log('error...', e);
    });
    // clear message input field
    input.value = '';
    // Return false to avoid redirect
    return false;
  });

   // Create query for messages
   const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
   onSnapshot(q, snaps => {
     // Reset page
     guestbook.innerHTML = '';
     // Loop through documents in database
     snaps.forEach(doc => {
       // Create an HTML entry for each document and add it to the chat
       const entry = document.createElement('p');
       entry.textContent = doc.data().name + ': ' + doc.data().text +':' + doc.data().time;
       guestbook.appendChild(entry);
     });
   });
}
main();
