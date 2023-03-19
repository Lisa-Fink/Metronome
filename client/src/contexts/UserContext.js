import React, { createContext, useState, useContext } from "react";
import app from "../firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "firebase/auth";
import { AppContext } from "./AppContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const {
    lightMode,
    bpm,
    timeSignature,
    downBeat,
    subdivide,
    mainBeat,
    key,
    tone,
    countIn,
    numMeasures,
    repeat,
    tempoInc,
    sectionPractice,
    tempoPractice,
    title,
    metronome_id,
  } = useContext(AppContext);
  const [user, setUser] = useState(undefined);
  const [_id, set_id] = useState(undefined);

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
      throw new Error("Error signing up user");
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

  const loginUser = async (email, password, setErrorMessage) => {
    console.log("logging in");
    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Signed in
      setUser(userCredential.user);
      console.log("got user ", userCredential.user.uid);
      // // Get user from db
      const headers = new Headers();
      const token = await userCredential.user.getIdToken();
      console.log("token ", token);
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(`/users/`, {
        method: "GET",
        headers,
      });
      const userDB = await response.json();
      console.log("db ", userDB);
      set_id(userDB._id);
      // TODO save metronomes and dms
      console.log("got id ", userDB);
    } catch (error) {
      // TODO change
      console.log(error);
      setErrorMessage(error.message);
    }
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
        lightSetting: lightMode,
      };

      const response = await fetch("/users/", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (response.status !== 200) {
        throw new Error("Error creating user");
      }
      set_id(response._id);
    } catch (error) {
      console.error(error);
      throw new Error("Error creating user");
    }
  };

  const saveNewMetronome = async (title) => {
    try {
      if (user !== undefined) {
        const token = await user.getIdToken();
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);
        headers.append("Content-Type", "application/json");

        console.log("title ", title);

        const settings = {
          bpm,
          timeSignature,
          downBeat,
          subdivide,
          mainBeat,
          key,
          tone,
          countIn,
          numMeasures,
          repeat,
          tempoInc,
          sectionPractice,
          tempoPractice,
          title,
        };
        // save settings to db
        const response = await fetch(`/users/${_id}/metronomes`, {
          method: "POST",
          headers,
          body: JSON.stringify({ settings: settings }),
        });
        if (response.status !== 201) {
          throw new Error("Error saving the metronome: ");
        }
        metronome_id.current = response.metronome_id;
        // TODO load new metronome into metronomes state
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const saveUpdateMetronome = async (setErrorMessage, metronome_id) => {
    //TODO rewrite
    try {
      if (user !== undefined) {
        const token = await user.getIdToken();
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);
        headers.append("Content-Type", "application/json");

        const settings = {
          bpm,
          timeSignature,
          downBeat,
          subdivide,
          mainBeat,
          key,
          tone,
          countIn,
          numMeasures,
          repeat,
          tempoInc,
          sectionPractice,
          tempoPractice,
          title,
        };
        // save settings to db
        const response = await fetch(
          `/users/${user.uid}/metronomes/${metronome_id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ settings: settings }),
          }
        );
        if (response.status !== 201) {
          throw new Error("Error saving the metronome.");
        }
      }
    } catch (error) {
      setErrorMessage(error.error);
    }
  };

  const saveDM = () => {};

  const contextValue = {
    user,
    setUser,
    signUpUser,
    loginUser,
    createUser,
    signOutUser,
    saveNewMetronome,
    saveUpdateMetronome,
    saveDM,
  };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
