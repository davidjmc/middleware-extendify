import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from '@firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB2ERsfXYYFKl9naYxCtnjBobIsq5Inf78",
    authDomain: "middleware-extendify.firebaseapp.com",
    projectId: "middleware-extendify",
    storageBucket: "middleware-extendify.appspot.com",
    messagingSenderId: "567977011065",
    appId: "1:567977011065:web:040acb41ac41d7f57531a8",
    measurementId: "G-EG7FS9T7PT"
  };

const app = initializeApp(firebaseConfig);

import our from './db.json' assert {type:'json'}

const db = getFirestore(app);
const _things = collection(db, 'Things');
const _components = collection(db, 'Components');

for (const component of our.components) {
    const { id, version, name, type, file } = component;
    const componentRef = doc(_components, id);
    await setDoc(componentRef, {
        version, name, type, file
    });
    console.log('Component added: ', id);
}
for (const thing of our.things) {
    const { id, components, attachments, starter, adaptability, configurations } = thing;
    const thingRef = doc(_things, id);

    await setDoc(thingRef, {
        components, attachments, starter, adaptability, configurations
    });
    console.log('thing updated: ', id);
    // break
}
