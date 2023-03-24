import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

import "../../styles/PopUp.css";

import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";

function UserAccountPopup({ setIsAccountOpen }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [invalidConfirmPassword, setInvalidConfirmPassword] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const { updatePassword, isLoggedIn, delUser } = useContext(UserContext);

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
    setErrorMessage("");
  }, [isUpdating, showConfirm]);

  useEffect(() => {
    // Automatically close if there is not a signed in user
    if (!isLoggedIn) {
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

  const handleUpdateCancel = (e) => {
    e.preventDefault();
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
      // Creates user in firebase, sets user
      await updatePassword(password, setErrorMessage);
      // Adds/Creates user in db
      setIsUpdating(false);
    } catch (error) {
      setErrorMessage("Unable to create account");
      console.error(error);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
    setIsUpdating(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await delUser();
    } catch (error) {
      setErrorMessage("Unable to delete account.");
    }
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Account</h2>
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
                <AiOutlineCloseCircle onClick={() => setShowConfirm(false)} />
              </div>
            </div>
          </div>
          <button className="type" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserAccountPopup;
