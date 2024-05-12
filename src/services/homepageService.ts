import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { SliderImage, SliderImageInput } from "../types";

const homepageCollectionRef = collection(db, "homepageContent");

export const getHomepageContent = async (): Promise<SliderImage[]> => {
  try {
    const snapshot = await getDocs(homepageCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SliderImage));
  } catch (error) {
    throw new Error("Failed to fetch homepage content");
  }
};

export const addHomepageContent = async (data: SliderImageInput): Promise<string> => {
  try {
    const response = await addDoc(homepageCollectionRef, data);
    return response.id;
  } catch (error) {
    throw new Error("Failed to add homepage content");
  }
};

export const updateHomepageContent = async (id: string, data: SliderImageInput): Promise<void> => {
  try {
    const docRef = doc(db, "homepageContent", id);
    await updateDoc(docRef, {...data});
  } catch (error) {
    throw new Error("Failed to update homepage content");
  }
};

export const deleteHomepageContent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, "homepageContent", id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error("Failed to delete homepage content");
  }
};
