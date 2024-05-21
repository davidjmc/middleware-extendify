//const firebase = require('firebase')
// const firestore = require('firebase/app/firestore')

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from '@firebase/firestore';

var firebaseConfig = {
    apiKey: "AIzaSyB2ERsfXYYFKl9naYxCtnjBobIsq5Inf78",
    authDomain: "middleware-extendify.firebaseapp.com",
    projectId: "middleware-extendify",
    storageBucket: "middleware-extendify.appspot.com",
    messagingSenderId: "567977011065",
    appId: "1:567977011065:web:040acb41ac41d7f57531a8",
    measurementId: "G-EG7FS9T7PT"
};
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

//const db = firebase.firestore()
// db.enablePersistence()

const app = initializeApp(firebaseConfig);

// const things = db.collection('things')
// const components = db.collection('components')

const db = getFirestore(app);

export const things = () => {
    // firebase.initializeApp(firebaseConfig);
    // const db = firebase.firestore()
    const db = getFirestore(app)
    //return db.collection('things')
    return collection(db, 'Things')
}

export const components = () => {
    // firebase.initializeApp(firebaseConfig);
    // const db = firebase.firestore()
    const db = getFirestore(app)
    return collection(db, 'Components')
}

// module.exports = {
//     things,
//     components
// }