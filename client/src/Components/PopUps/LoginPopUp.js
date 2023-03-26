import { useState, useEffect, useContext, useRef } from "react";
import "../../styles/PopUp.css";

import { AiOutlineClose, AiOutlineCheckCircle } from "react-icons/ai";
import { UserContext } from "../../contexts/UserContext";

function LoginPopup({ setIsLoginOpen, handleSwitchSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(true);
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { isLoggedIn, loginUser } = useContext(UserContext);
  const loginInProgress = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        // Escape key
        setIsLoginOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsLoginOpen]);

  useEffect(() => {
    if (isLoggedIn && !loginInProgress.current) {
      handleClose();
    }
  }, [isLoggedIn]);

  const handleEmailChange = (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newEmail = e.target.value;
    if (!emailRegex.test(newEmail)) {
      setInvalidEmail(true);
    } else {
      setInvalidEmail(false);
    }
    setEmail(newEmail);
  };

  const handlePasswordChange = (e) => {
    const passwordRegex = /^\w{6,}$/;
    const newPassword = e.target.value;
    if (!newPassword.length || !passwordRegex.test(newPassword)) {
      setInvalidPassword(true);
    } else {
      setInvalidPassword(false);
    }
    setPassword(newPassword);
  };
  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }
    loginInProgress.current = false;
    setIsLoginOpen(false);
  };

  const handleLogin = async (e) => {
    // Firebase login
    e.preventDefault();
    if (invalidEmail) {
      setErrorMessage("Please enter a valid email");
      return;
    }
    if (invalidPassword) {
      setErrorMessage("Please enter a valid password");
      return;
    }
    try {
      loginInProgress.current = true;
      await loginUser(email, password);
      loginInProgress.current = false;
      setIsLoginOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="invalid-error">
            {errorMessage && <p>{errorMessage}</p>}
          </div>
          <label>
            Email:
            <div className="input-div">
              <input
                value={email}
                onChange={handleEmailChange}
                placeholder="name@host.com"
              />
              {!invalidEmail && <AiOutlineCheckCircle className="validate" />}
            </div>
          </label>

          <label>
            Password:
            <div className="input-div">
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
              {!invalidPassword && (
                <AiOutlineCheckCircle className="validate" />
              )}
            </div>
          </label>
          <div className="button-div">
            <button type="submit">Login</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
          <div className="change-pop-up">
            <p>Need an account?</p>
            <span className="link-text" onClick={handleSwitchSignUp}>
              Sign-Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPopup;
