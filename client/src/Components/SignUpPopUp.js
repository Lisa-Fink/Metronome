import { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";

import "../styles/PopUp.css";

import { AiOutlineClose, AiOutlineCheckCircle } from "react-icons/ai";

function SignUpPopup({ setIsSignUpOpen, handleSwitchLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(true);
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [invalidConfirmPassword, setInvalidConfirmPassword] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { signUpUser, createUser, user } = useContext(UserContext);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        // Escape key
        setIsSignUpOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsSignUpOpen]);

  useEffect(() => {
    // Automatically close if there is a signed in user
    if (user) {
      handleClose();
    }
  }, [user]);

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

  const handleConfirmPasswordChange = (e) => {
    const newConfirm = e.target.value;
    if (newConfirm === password && !invalidPassword) {
      setInvalidConfirmPassword(false);
    } else {
      setInvalidConfirmPassword(true);
    }
    setConfirmPassword(newConfirm);
  };

  const handlePasswordChange = (e) => {
    const passwordRegex = /^\w{6,}$/;
    const newPassword = e.target.value;
    if (!passwordRegex.test(newPassword)) {
      setInvalidPassword(true);
      if (!invalidConfirmPassword) {
        setInvalidConfirmPassword(true);
      }
    } else {
      setInvalidPassword(false);
      // valid password, and confirm password is the same
      if (newPassword === confirmPassword) {
        setInvalidConfirmPassword(false);
      } else if (!invalidConfirmPassword) {
        setInvalidConfirmPassword(true);
      }
    }
    setPassword(newPassword);
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsSignUpOpen(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    // validate
    if (invalidEmail) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
    if (invalidPassword) {
      setErrorMessage("Please enter a valid password.");
      return;
    }
    if (invalidConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // Creates user in firebase, sets user
      const newUser = await signUpUser(email, password, setErrorMessage);
      // Adds/Creates user in db
      createUser(newUser);
      handleClose();
    } catch (error) {
      setErrorMessage("Unable to create account");
      console.error(error);
    }
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
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
          <label>
            Confirm Password:
            <div className="input-div">
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {!invalidConfirmPassword && (
                <AiOutlineCheckCircle className="validate" />
              )}
            </div>
          </label>

          <div className="button-div">
            <button type="submit">Sign Up</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
          <div className="change-pop-up">
            <p>Already have an account?</p>
            <span className="link-text" onClick={handleSwitchLogin}>
              Log In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpPopup;
