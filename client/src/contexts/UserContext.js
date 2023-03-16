import React, { createContext, useState, useContext } from "react";
import app from "../firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { AppContext } from "./AppContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { lightSetting } = useContext(AppContext);
  const [user, setUser] = useState(undefined);

  const signUpUser = async (email, password, setErrorMessage) => {
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Sign in the new user
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      //TODO add custom error message
      const errorCode = error.code;
      const errorMessage = error.message;
      setErrorMessage(errorMessage);
    }
  };

  const signOutUser = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setUser(undefined);
      })
      .catch((error) => {
        // An error happened.
        console.error(error);
      });
  };

  /***************************************/
  // CRUD Operations

  // Create new user in db
  const createUser = async (user) => {
    // Create db for new user

    try {
      // const token = await user.getIdToken();
      const headers = new Headers();
      // headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      const body = {
        uid: user.uid,
        drumMachines: [],
        metronomes: [],
        lightSetting: lightSetting,
      };

      await fetch("http://localhost:3000/users/", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const contextValue = {
    user,
    setUser,
    signUpUser,
    createUser,
    signOutUser,
  };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
