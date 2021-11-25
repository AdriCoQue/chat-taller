import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCnZ4jJMhoG0Vu__UDewTUt4vlAdQGM628",
  authDomain: "chat-5798c.firebaseapp.com",
  projectId: "chat-5798c",
  storageBucket: "chat-5798c.appspot.com",
  messagingSenderId: "572657804416",
  appId: "1:572657804416:web:fb00ddc2e538846bb43265"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat Prueba</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
      <button onClick={signInWithGoogle}>Log in with Google</button>
  )

}
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Log Out</button>
  )
}
function ChatRoom() {
  const dummy = useRef();

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(1024);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: displayName + ": " + formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    setFormValue('');
    
  }
  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </main>

  <form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Escribe aquí tu mensaje" />

    <button type="submit" disabled={!formValue}>Enviar</button>

    </form>
  </>)

  

}
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
