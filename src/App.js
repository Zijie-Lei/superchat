import React, { useRef, useState } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from "firebase/auth";
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Button from "react-bootstrap/Button";

const firebaseConfig = {
  apiKey: "AIzaSyAkX2i7PC0fL7EQXM2zSEKN4v72-iKvCIc",
  authDomain: "superchat-992c6.firebaseapp.com",
  projectId: "superchat-992c6",
  storageBucket: "superchat-992c6.appspot.com",
  messagingSenderId: "971322661375",
  appId: "1:971322661375:web:5f5d0320650d1e92f9efca",
  measurementId: "G-29ZX8WD51E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = new getAuth();

function App() {

  const [user] = new useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
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
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }
  
  const signInWithGitHub = () => {
    const provider = new GithubAuthProvider();
    signInWithPopup(auth, provider)
  }

  return (
    <>
      <Button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</Button>
      <Button className="sign-in" onClick={signInWithGitHub}>Sign in with GitHub</Button>
    </>
  )

}

function SignOut() {
  
  const out = () => {
    signOut(auth).then(() => {
      console.log('sign out successfully')
    }).catch((error) => {
      console.error('sign out failed')
    });
  }
  return auth.currentUser && (
    <Button onClick={out}>Sign Out</Button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(db, 'messages'), {
      text: formValue,
      createdAt: serverTimestamp(),
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
      <img referrerpolicy='no-referrer' src={photoURL} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
