import './Login.css'

function Login(){
    return (
        <div className="container">
            <div className="header">
                <h1 className="text">Sign In or Create Account</h1>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                <div className="input">
                    <p>Username</p>
                    <input type="text" />
                </div>
            </div>
            <div className="inputs">
                <div className="input">
                    <p>Password</p>
                    <input type="password" />
                </div>
            </div>
        </div>
    )
}

export default Login;