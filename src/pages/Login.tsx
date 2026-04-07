import './Login.css'
import { useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Login(){
    // for accessing text info
    const userRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    // the below code is used to toggle between visible and hidden password states
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
    const handleAccountCreation = async (username: string, email: string, password: string) => {
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                password: password,
                flick_score: 0,
                reaction_score: 0,
                trace_score: 0
            });
        } catch (e : unknown){
            if(e instanceof Error){
                console.error('Error Signing Up:', e.message);
            }
            else{
                console.error('Unknown Error Occurred When Signing Up')
            }
        }
    };

    // log in handler
    const handleLogin = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('You logged in, yay')
        } catch (e : unknown){
            if(e instanceof Error){
                console.error('Error Logging In:', e.message);
            }
            else{
                console.error('Unknown Error Occurred When Logging In')
            }
        }
    };

    return (
        <div className="container">
            <h1>Aim Rivals</h1>
            <div className="login-container">
                <div className="header">
                    <h2 className="text">Log In or Create Account</h2>
                    <div className="underline"></div>
                </div>
                <div className="inputs">
                    <div className="input">
                        <p className="input-text">Username</p>
                        <input id="username" type="text" ref={userRef} />
                    </div>
                    <div className="input">
                        <p className="input-text">Email</p>
                        <input id="email" type="text" ref={emailRef} />
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
                        if(userRef.current !== null && emailRef.current !== null && passwordRef.current != null){
                            handleAccountCreation(userRef.current.value, emailRef.current.value, passwordRef.current.value);
                        }
                        else {
                            console.error('Something went wrong when trying to get input data for account creation');
                        }
                        
                    }}>Create Account</button>
                    
                    <button id="login_submit-button" onClick={() => {
                        if(emailRef.current !== null && passwordRef.current != null){
                            handleLogin(emailRef.current.value, passwordRef.current.value);
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