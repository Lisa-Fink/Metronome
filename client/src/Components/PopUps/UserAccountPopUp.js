import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../../contexts/UserContext";

import "../../styles/PopUp.css";

import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { EmailAuthProvider } from "firebase/auth";

function UserAccountPopup({ setIsAccountOpen }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [invalidConfirmPassword, setInvalidConfirmPassword] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rePromptPass, setRePromptPass] = useState("");
  const [email, setEmail] = useState("");

  const [rePrompt, setRePrompt] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { isLoggedIn, delUser, changePassword, reAuthenticate } =
    useContext(UserContext);

  const finishSuccess = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        // Escape key
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsAccountOpen]);

  useEffect(() => {
    if (finishSuccess.current === true && successMessage) {
      finishSuccess.current = false;
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
  }, [isUpdating, showConfirm]);

  useEffect(() => {
    // Automatically close if there is not a signed in user
    if (!isLoggedIn && !isUpdating) {
      handleClose();
    }
  }, [isLoggedIn]);

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
    setIsAccountOpen(false);
  };

  const handleUpdateCancel = () => {
    setConfirmPassword("");
    setPassword("");
    setIsUpdating(false);
  };

  const handleUpdateClick = () => {
    setIsUpdating(true);
    setErrorMessage("");
    setShowConfirm(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    // validate
    if (invalidPassword) {
      setErrorMessage("Please enter a valid password.");
      return;
    }
    if (invalidConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await changePassword(password);
      updatePasswordSuccess();
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setRePrompt("password");
      } else {
        setErrorMessage("Unable to change password.");
      }
    }
  };

  const updatePasswordSuccess = () => {
    finishSuccess.current = true;
    handleUpdateCancel();
    setSuccessMessage("Successfully Updated Password");
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
    setIsUpdating(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await delUser();
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setRePrompt("delete");
      } else {
        setErrorMessage("Unable to delete account.");
      }
    }
  };

  const handleRePrompt = async () => {
    try {
      if (rePromptPass.length < 6)
        throw new Error("Password must be at least 6 characters.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        throw new Error("Email address is not valid.");
      const credential = EmailAuthProvider.credential(email, rePromptPass);
      await reAuthenticate(credential);
    } catch (err) {
      setErrorMessage("Invalid Email/Password.");
    }
    setRePrompt(false);
    if (rePrompt === "password") {
      try {
        await changePassword(password);
        updatePasswordSuccess();
      } catch (error) {
        setErrorMessage("Unable to change password.");
      }
    } else if (rePrompt === "delete") {
      handleDeleteConfirm();
    }
  };

  const rePromptDiv = (
    <div id="rePrompt">
      <h3>Login again to continue</h3>
      <div>{errorMessage}</div>
      <label htmlFor="email">
        Email:
        <div className="input-div">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@host.com"
          ></input>
        </div>
      </label>
      <label htmlFor="password">
        Password:
        <div className="input-div">
          <input
            name="password"
            type="password"
            value={rePromptPass}
            onChange={(e) => setRePromptPass(e.target.value)}
          />
        </div>
      </label>
      <button onClick={handleRePrompt}>Submit</button>
    </div>
  );

  return (
    <div className="pop-up-container account-pop">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        {rePrompt !== false ? (
          rePromptDiv
        ) : (
          <>
            <h2>Account</h2>
            {successMessage && <div>{successMessage}</div>}
            <div className="account-div">
              {errorMessage && <div>{errorMessage}</div>}
              {!isUpdating && (
                <button className="type" onClick={handleUpdateClick}>
                  Update Password
                </button>
              )}
              <div className={isUpdating ? "" : "hidden"}>
                <form onSubmit={handleUpdatePassword}>
                  <legend>Update Password</legend>
                  <div className="invalid-error"></div>
                  <label>
                    New Password:
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
                    Confirm New Password:
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
                    <button type="submit">Update Password</button>
                    <button onClick={handleUpdateCancel}>Cancel</button>
                  </div>
                </form>
              </div>
              <div className="delete-div">
                <h3>DANGER</h3>
                <button className="delete" onClick={handleDeleteClick}>
                  Delete Account
                </button>
                <div className={showConfirm ? "delete-act" : "hidden"}>
                  <p>WARNING: THIS WILL DELETE YOUR ACCOUNT!! Confirm </p>
                  <div className="delete-act-icon">
                    <AiOutlineCheckCircle onClick={handleDeleteConfirm} />
                    <AiOutlineCloseCircle
                      onClick={() => setShowConfirm(false)}
                    />
                  </div>
                </div>
              </div>
              <button className="type" onClick={handleClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserAccountPopup;
