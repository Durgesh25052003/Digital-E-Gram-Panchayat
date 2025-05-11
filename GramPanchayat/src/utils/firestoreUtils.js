/* eslint-disable no-useless-catch */
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../Config/Firebase';

// Create a new document with custom ID
export const createDocument = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef;
    } catch (error) {
        throw error;
    }
};

// Get a document by ID
export const getDocument = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        throw error;
    }
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date()
        });
        return docRef;
    } catch (error) {
        throw error;
    }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        throw error;
    }
};

// Query documents
export const queryDocuments = async (collectionName, conditions) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const q = query(
            collection(db, collectionName),
            ...conditions.map(c => where(c.field, c.operator, c.value))
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
};