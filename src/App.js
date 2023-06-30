import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyC8ZuaGCk6tS8S_zS1oo0XhN_Db8czDzjc",
  authDomain: "aplicacaodechat.firebaseapp.com",
  projectId: "aplicacaodechat",
  storageBucket: "aplicacaodechat.appspot.com",
  messagingSenderId: "218005620145",
  appId: "1:218005620145:web:14874122fd459bd731a990",
  measurementId: "G-R6CFGFM0W0"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);


  return (
    <div className="App">
      <header>
        <h1>Super Chat!</h1>
        <SignOut/>
      </header>
      <section>
          {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
export default App;

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (<>
    <button onClick={signInWithGoogle}>Logar com uma conta Google</button>
    <p>Seja legal, o banimento é permanente e automático.</p>
    <p>Versão de teste: banimento desativado.</p>

  </>);
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Deslogar</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("mensagens");
  const query = messagesRef.orderBy('DataCriacao').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id' });

  const [formvalue, setformvalue] = useState("");

  const sendForm = async (e) => {
    
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      DataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
      IdUsuario: uid,
      fotoURL: photoURL,
      mensagem: formvalue

    })

    setformvalue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return(<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendForm}>
      <input value={formvalue} onChange={(e) => setformvalue(e.target.value)} placeholder="Espalhe suas palavras!" />
      <button type="submit" disabled={!formvalue}>Enviar</button>
    </form>

  </>);
  
}

function ChatMessage(props) {

  const { mensagem, uid, fotoURL , DataCriacao } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'receoved' : 'sent';
  
  let dataLocal = "";
  if (DataCriacao) {
    const date = DataCriacao.toDate();
    dataLocal = date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });

  }

  return (<>
    <div className={`message ${messageClass}`}>
        <img src={fotoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        <div>
          <span>{dataLocal}</span>
          <p>{mensagem}</p>
        </div>
    </div>
  </>);
}




