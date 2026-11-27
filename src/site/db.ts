import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { CFG } from "../firebase";
export const db = CFG.projectId ? getFirestore(initializeApp(CFG)) : null;
