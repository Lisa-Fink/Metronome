import React, { createContext, useState, useContext, useRef } from "react";
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
    setLightMode,
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
  } = useContext(AppContext);
  const [user, setUser] = useState(undefined);
  const [_id, set_id] = useState(undefined);
  const [userMetronomes, setUserMetronomes] = useState([]);
  const [userDrumMachines, setUserDrumsMachines] = useState([]);
  const metronome_id = useRef("");
  const dm_id = useRef("");

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
      setErrorMessage("Error Creating a New Account.");
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
    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Signed in
      setUser(userCredential.user);
      // // Get user from db
      const headers = new Headers();
      const token = await userCredential.user.getIdToken();
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(`/users/`, {
        method: "GET",
        headers,
      });
      const userDB = await response.json();
      set_id(userDB._id);
      setUserDrumsMachines(userDB.drumMachines);
      setUserMetronomes(userDB.metronomes);
      setLightMode(userDB.lightMode);
    } catch (error) {
      // TODO change
      setErrorMessage("Error Logging Into Account.");
    }
  };

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
      if (response.status !== 201) {
        throw new Error("Error creating user");
      }
      const data = await response.json();
      set_id(data._id);
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

        if (!title) title = "Untitled";

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

        const data = await response.json();
        metronome_id.current = data._id;
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const saveUpdateMetronome = async (setErrorMessage) => {
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
          `/users/${_id}/metronomes/${metronome_id.current}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ settings: settings }),
          }
        );
        if (response.status !== 200) {
          throw new Error("Error saving the updated the metronome.");
        }
      }
    } catch (error) {
      setErrorMessage("Error Updating the Metronome");
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
