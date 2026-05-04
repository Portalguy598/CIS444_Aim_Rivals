import './Login.css'
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';

function Login(){
    // for navigation
    const navigate = useNavigate();

    useEffect(() => {
  document.body.classList.add("login-page");

  return () => {
    document.body.classList.remove("login-page");
  };
}, []);

    // for accessing text info
    const userRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    // toggle between visible and hidden password states
    const [passwdVisibility, setPasswdVisibility] = useState('password');
    // this function gets placed into the onClick JSX handler
    const togglePassword = () => {
        if(passwdVisibility === 'password'){
            setPasswdVisibility('text');
        }
        else {
            setPasswdVisibility('password');
        }
    };

    // create account handler
    const handleAccountCreation = async (username: string, password: string) => {
        try{
            if(username.length < 4){
                alert('Username needs a minimum of 4 characters');
                return;
            }
            else if(username.length > 40){
                alert('Username should not exceed 40 characters');
                return;
            }

            // firebase authentication requires email, so convert username into fake email
            const email = username.trim() + '@fake.com';

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // create document for the new user
            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                password: password,
                flick_score: 0,
                reaction_score: 0,
                trace_score: 0
            });
            alert('Account created');
        } catch (e : unknown){
            if(e instanceof Error){
                console.error('Error Signing Up:', e.message);
                if(e.message ===  'Firebase: Error (auth/invalid-email).'){
                    alert('Could not create account: invalid username');
                }
                else if(e.message === 'Firebase: Error (auth/email-already-in-use).'){
                    alert('Could not create account: username taken');
                }
                else{
                    alert('Could not create account: ' + e.message);
                }
                
            }
            else{
                console.error('Unknown Error Occurred When Signing Up');
                alert('Could not create account');
            }
            
        }
    };

    // log in handler
    const handleLogin = async (username: string, password: string) => {
        try {
            // convert username into fake email
            const email = username + '@fake.com';
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/mode');
        } catch (e : unknown){
            if(e instanceof Error){
                console.error('Error Logging In:', e.message);
            }
            else{
                console.error('Unknown Error Occurred When Logging In')
            }
            alert('Could not log in');
        }
    };

    return (
        <div className="containerLogin">
            <h1>Aim Rivals</h1>
            <div className="login-container">
                <div className="headerLogin">
                    <h2 className="textLogin">Log In or Create Account</h2>
                    <div className="underlineLogin"></div>
                </div>
                <div className="inputs">
                    <div className="input">
                        <p className="input-text">Username</p>
                        <input id="username" type="text" ref={userRef} />
                    </div>
                    <div className="input">
                        <p className="input-text">Password</p>
                        {/* passwdVisibility determines whether it is considered text or password input*/}
                        <input id="password" type={passwdVisibility} ref={passwordRef}/>
                        {/* onClick determines the function performed when the button is clicked in JSX/TSX */}
                        <button id="passwd-toggle" onClick={togglePassword}>Toggle</button>
                    </div>
                </div>
                <div className="submit-container">
                    <p></p>
                    <button id="signup-submit-button" onClick={() => {
                        if(userRef.current !== null && passwordRef.current !== null){
                            handleAccountCreation(userRef.current.value, passwordRef.current.value);
                        }
                        else {
                            console.error('Something went wrong when trying to get input data for account creation');
                        }
                        
                    }}>Create Account</button>
                    
                    <button id="login_submit-button" onClick={() => {
                        if(userRef.current !== null && passwordRef.current !== null){
                            handleLogin(userRef.current.value, passwordRef.current.value);
                        }
                        else {
                            console.error('Something went wrong when trying to get input data when logging in');
                        }
                    }}>Log In</button>
                </div>
            </div>
        </div>
        
    )
}

export default Login;