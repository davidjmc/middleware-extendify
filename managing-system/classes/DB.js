import { doc, getDoc, setDoc, updateDoc, where, query, getDocs, collection } from '@firebase/firestore';
import { components, things } from '../firebase.js';
import fs from 'fs';

export default class DB {
    static async getComponent(id) {
        const componentDocRef = doc(components(), id);
        const componentDocSnapshot = await getDoc(componentDocRef);
        
        if (componentDocSnapshot.exists()) {
            return componentDocSnapshot.data();
        } else {
            throw new Error(`Component ${id} does not exist`);
        }
    }

    static async getComponentsByName(name) {
        
        const componentDocRef = components();
        const snapshot = await getDocs(query(componentDocRef, where('name', '==', name)));
        
        let list = []
        await snapshot.forEach(doc => {
            let component = doc.data()
            component._id = doc.id
            list.push(component)
        })
        return list
    }

    static async getThing(id) {
        const thingDocRef = doc(things(), id);
        const thingDocSnapshot = await getDoc(thingDocRef);

        if (thingDocSnapshot.exists()) {
            return thingDocSnapshot.data();
        } else {
            throw new Error(`Thing ${id} does not exist`);
        }
    }

    // static async getThingRolledBack(id) {
    //     let thingDoc = await things().doc(id)
    //     if (!(await thingDoc.get()).exists) {
    //         throw `Thing ${id} does not exist`
    //     }
    //     let rolledBack = thingDoc.collection('rolledBack')
    //     console.log((await rolledBack.get()))
    // }

    static async saveThing(thing) {
        console.log('Save thing')
        const thingDocRef = doc(things(), thing.id);

        await updateDoc(thingDocRef, {
            components: thing.components.map(c => c.id),
            attachments: thing.attachments.map(a => ({
                from: a.from.type,
                to: a.to.type
            })),
            starter: thing.starter.map(c => c.type),
            trialMode: thing.trialMode,
            'configurations': {
                'application': thing.configurations.application,
                'device': thing.configurations.device,
                'environment': thing.configurations.environment
            }
        }, { depth: 4 });
    }

    static async backupThing(id) {
        const thingDocRef = doc(things(), id);
        const thingDocSnapshot = await getDoc(thingDocRef);

        if (!thingDocSnapshot.exists()) {
            throw `Thing ${id} does not exist`
        }

        const thing = thingDocSnapshot.data();

        await setDoc(thingDocRef, {
        backup: {
            components: thing.components,
            attachments: thing.attachments,
            starter: thing.starter,
            configurations: thing.configurations 
        }
    }, { merge: true });
    }

    static async rollbackThing(id) {
        const thingDocRef = doc(things(), id);
        const thingDocSnapshot = await getDoc(thingDocRef);
        
        if (!thingDocSnapshot.exists()) {
            throw `Thing ${id} does not exist`
        }

        const thing = thingDocSnapshot.data();

        // saving current version to rolledBack
        let rolledBack = collection(thingDocRef, 'rolledBack');
        await setDoc(doc(rolledBack, '' + new Date().getTime()), {
            'components': thing.components,
            'attachments': thing.attachments,
            'starter': thing.starter,            
        });

        if (!thing.backup) {
            throw `Cannot rollback without a backup (thing ${id})`
        }

        await updateDoc(thingDocRef, {
            'components': thing.backup.components,
            'attachments': thing.backup.attachments,
            'starter': thing.backup.starter,
            'trialMode': false
        });
    }

    static async getFile(filename, path = 'components') {
        // DEBUG
        let bases = ['../library', './library']
        for (let base of bases) {
            if (fs.existsSync(`${base}/${path}/${filename}.py`)) {
                return fs.readFileSync(`${base}/${path}/${filename}.py`)
            }
        }
        throw `File ${filename}.py does not exists`
    }
}
