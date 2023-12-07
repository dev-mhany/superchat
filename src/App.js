import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDW2tPio4ovTsaE7RlBYGB10Klo8gydveA",
  authDomain: "superchat-53eb2.firebaseapp.com",
  projectId: "superchat-53eb2",
  storageBucket: "superchat-53eb2.appspot.com",
  messagingSenderId: "823023893616",
  appId: "1:823023893616:web:769d941d82cf82d7d408b5"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Global Chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithGoogle = () => {
    if (isSigningIn) return; // Prevent multiple sign-in attempts

    setIsSigningIn(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider).catch(error => {
      // Handle errors here
      setIsSigningIn(false); // Reset the sign-in flag upon error
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in was cancelled by the user.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Another sign-in was initiated before the previous one completed.');
      } else {
        console.error('An unknown error occurred during sign-in:', error);
      }
    });
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle} disabled={isSigningIn}>
        Sign in with Google
      </button>
      <p> Be Nice :) </p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt='avatar' />
      <p>{text}</p>
    </div>
  </>)
}


export default App;