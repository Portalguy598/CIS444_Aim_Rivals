import './Login.css'
import { useState } from 'react';

function Login(){
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
                        <input id="username" type="text" />
                    </div>
                    <div className="input">
                        <p className="input-text">Password</p>
                        {/* passwdVisibility determines whether it is considered text or password input*/}
                        <input id="password" type={passwdVisibility} />
                        {/* onClick determines the function performed when the button is clicked in JSX/TSX */}
                        <button id="passwd-toggle" onClick={togglePassword}>Toggle</button>
                    </div>
                </div>
                <div className="submit-container">
                    <p></p>
                    <button id="signup-submit-button">Create Account</button>
                    <button id="login_submit-button">Log In</button>
                </div>
            </div>
        </div>
        
    )
}

export default Login;