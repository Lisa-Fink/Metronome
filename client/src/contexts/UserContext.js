import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import app from "../firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
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
    setTitle,
    loadMetronomeData,
    loadDMData,
    instruments,
    rhythmSequence,
    rhythmGrid,
    measures,
    dMTitle,
    setDMTitle,
  } = useContext(AppContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMetronomes, setUserMetronomes] = useState([]);
  const [userDrumMachines, setUserDrumMachines] = useState([]);
  const loggingIn = useRef(false);
  const metronome_id = useRef("");
  const dm_id = useRef("");

  useEffect(() => {
    // logs in user on refresh
    const auth = getAuth(app);
    const stateChanged = auth.onAuthStateChanged(async (fbUser) => {
      if (!loggingIn.current && fbUser && !isLoggedIn) {
        try {
          loggingIn.current = true;
          await getUser(fbUser);
          loggingIn.current = false;
          setIsLoggedIn(true);
        } catch (error) {
          loggingIn.current = false;
        }
        setIsLoggedIn(true);
      } else if (!fbUser && isLoggedIn && !loggingIn.current) {
        setIsLoggedIn(false);
        setUserMetronomes([]);
        setUserDrumMachines([]);
      }
    });
    return () => {
      stateChanged();
    };
  }, [loggingIn.current, isLoggedIn]);

  const loadMetronome = (index) => {
    if (index < 0 || index >= userMetronomes.length) {
      // TODO: Error handler?
      return;
    }
    const chosen = userMetronomes[index];
    metronome_id.current = chosen._id;
    loadMetronomeData(chosen);
  };

  const loadDM = (index) => {
    if (index < 0 || index >= userDrumMachines.length) {
      // TODO: Error handler?
      return;
    }
    const chosen = userDrumMachines[index];
    dm_id.current = chosen._id;
    loadDMData(chosen);
  };

  const signUpUser = async (email, password) => {
    try {
      loggingIn.current = true;
      setIsLoggedIn(true);
      const user = await createUserFB(email, password);
      const userDB = await createUserDB(user);
      loggingIn.current = false;
      // set again onAuthChange triggers a false
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      loggingIn.current = false;
      throw error;
    }
  };

  const createUserFB = async (email, password) => {
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Sign in the new user
      return userCredential.user;
    } catch (error) {
      //TODO add custom error message
      throw new Error("Error signing up user");
    }
  };

  const createUserDB = async (user) => {
    // Create db for new user
    try {
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${token}`);

      const body = {
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
    } catch (error) {
      console.error(error);
      throw new Error("Error creating user");
    }
  };

  const signOutUser = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setIsLoggedIn(false);
        setUserMetronomes([]);
        setUserDrumMachines([]);
      })
      .catch((error) => {
        // An error happened.
        console.error(error);
      });
  };

  const loginUser = async (email, password, setErrorMessage) => {
    const auth = getAuth(app);
    try {
      setIsLoggedIn(true);
      loggingIn.current = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Signed in
      await getUser(userCredential.user);
      loggingIn.current = false;
    } catch (error) {
      setIsLoggedIn(false);
      loggingIn.current = false;
      // if firebase successfully logged in but mongo didn't retrieve user
      // do not stay signed in (could be changed)
      if (auth.currentUser) {
        signOutUser();
      }
      setErrorMessage("Error Logging Into Account.");
    }
  };

  const getUser = async (user) => {
    if (isLoggedIn) return;
    try {
      // Get user from db
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      const response = await fetch(`/users/`, {
        method: "GET",
        headers,
      });
      const userDB = await response.json();
      setUserDrumMachines(userDB.drumMachines);
      setUserMetronomes(userDB.metronomes);
      setLightMode(userDB.lightSetting);
    } catch (error) {
      // TODO change
      throw new Error(error);
    }
  };

  const saveNewMetronome = async (title) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
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
        const response = await fetch(`/users/metronomes`, {
          method: "POST",
          headers,
          body: JSON.stringify({ settings: settings }),
        });
        if (response.status !== 201) {
          throw new Error("Error saving the metronome: ");
        }

        const data = await response.json();
        setUserMetronomes([...userMetronomes, data]);
        metronome_id.current = data._id;
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const saveUpdateMetronome = async (setErrorMessage) => {
    //TODO rewrite
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
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
          `/users/metronomes/${metronome_id.current}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ settings: settings }),
          }
        );
        if (response.status !== 200) {
          throw new Error("Error saving the updated metronome.");
        }
        // update the metronome stored in userMetronomes state
        for (let i = 0; i < userMetronomes.length; i++) {
          if (userMetronomes[i]._id === metronome_id.current) {
            for (const setting in settings) {
              userMetronomes[i][setting] = settings[setting];
            }
            break;
          }
        }
      }
    } catch (error) {
      setErrorMessage("Error Updating the Metronome");
    }
  };

  const saveNewDM = async (title) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      // Ignore attempt to save when logged out or no instruments added
      if (user === undefined) {
        throw new Error("You must be logged in to save.");
      }

      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      if (!title) title = "Untitled";

      const settings = {
        bpm,
        timeSignature,
        measures,
        instruments,
        rhythmSequence: rhythmSequence.current,
        rhythmGrid,
        title,
      };
      // save settings to db
      const response = await fetch(`/users/drum-machines`, {
        method: "POST",
        headers,
        body: JSON.stringify({ settings: settings }),
      });
      if (response.status !== 201) {
        throw new Error("Error saving the metronome");
      }

      const data = await response.json();
      setUserDrumMachines([...userDrumMachines, data]);
      dm_id.current = data._id;
    } catch (error) {
      throw new Error(error);
    }
  };

  const saveUpdateDM = async (setErrorMessage) => {
    //TODO rewrite
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      // Ignore attempt to save when logged out or no instruments added
      if (user === undefined) {
        throw new Error("No rhythms were added.");
      }
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");

      const settings = {
        bpm,
        timeSignature,
        measures,
        instruments,
        rhythmSequence: rhythmSequence.current,
        rhythmGrid,
        title: dMTitle,
      };
      // save settings to db
      const response = await fetch(`/users/drum-machines/${dm_id.current}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ settings: settings }),
      });
      if (response.status !== 200) {
        throw new Error("Error saving the updated drum machine .");
      }
      // update the metronome stored in userMetronomes state
      for (let i = 0; i < userDrumMachines.length; i++) {
        if (userDrumMachines[i]._id === dm_id.current) {
          for (const setting in settings) {
            userDrumMachines[i][setting] = settings[setting];
          }
          break;
        }
      }
    } catch (error) {
      setErrorMessage("Error Updating the Drum Machine ");
    }
  };

  const deleteMetronome = async (metronomeIdx, setErrorMessage) => {
    if (metronomeIdx < 0 || metronomeIdx >= userMetronomes.length)
      throw new Error("Invalid Metronome");
    const delete_id = userMetronomes[metronomeIdx]._id;
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user == undefined) throw new Error("User not logged in.");
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      // delete metronome from db
      const response = await fetch(`/users/metronomes/${delete_id}`, {
        method: "DELETE",
        headers,
      });
      if (response.status !== 204) {
        throw new Error("Error deleting the metronome.");
      }

      // remove from userMetronomes
      setUserMetronomes((prevMetronomes) =>
        prevMetronomes.filter((x, i) => i !== metronomeIdx)
      );
      // check if the deleted metronome is currently loaded
      if (metronome_id.current == delete_id) {
        metronome_id.current = "";
        setTitle("");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const deleteDM = async (dmIdx, setErrorMessage) => {
    if (dmIdx < 0 || dmIdx >= userDrumMachines.length)
      throw new Error("Invalid Drum Machine");
    const delete_id = userDrumMachines[dmIdx]._id;
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user == undefined) throw new Error("User not logged in.");
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      // delete metronome from db
      const response = await fetch(`/users/drum-machines/${delete_id}`, {
        method: "DELETE",
        headers,
      });
      if (response.status !== 204) {
        throw new Error("Error deleting the drum machine.");
      }

      // remove from userMetronomes
      setUserDrumMachines((prevDrumMachines) =>
        prevDrumMachines.filter((x, i) => i !== dmIdx)
      );
      // check if the deleted metronome is currently loaded
      if (dm_id.current == delete_id) {
        dm_id.current = "";
        setDMTitle("");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const saveLightModeSetting = async (lightMode) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user == undefined) throw new Error("User not logged in.");
      const token = await user.getIdToken();
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      headers.append("Content-Type", "application/json");
      const response = await fetch("/users/light-setting", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ lightSetting: lightMode }),
      });
    } catch (error) {}
  };

  const delUser = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user == undefined) throw new Error("User not logged in.");
      const token = await user.getIdToken();
      const headers = new Headers();
      // Delete from mongo
      headers.append("Authorization", `Bearer ${token}`);
      const response = await fetch("/users", {
        method: "DELETE",
        headers,
      });
      if (response.status !== 204) {
        throw new Error("Error deleting user.");
      }
      // Delete from FB
      await deleteUser(user);
      if (auth.currentUser) {
        signOutUser();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const contextValue = {
    signUpUser,
    loginUser,
    signOutUser,
    saveNewMetronome,
    saveUpdateMetronome,
    saveNewDM,
    saveUpdateDM,
    userMetronomes,
    userDrumMachines,
    loadMetronome,
    loadDM,
    getUser,
    deleteMetronome,
    deleteDM,
    saveLightModeSetting,
    isLoggedIn,
    delUser,
  };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
