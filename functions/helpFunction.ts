import { ItemData } from "@/functions/dataType";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, storage } from "../app/firebase";
import { ref, deleteObject } from "firebase/storage";
export async function fetchData(uid: string) {
  try {
    const querySnapshot = await getDocs(collection(db, "users", uid, "items"));
    const fetchedData: ItemData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      company: doc.data().company || "",
      cost: doc.data().cost || 0,
      description: doc.data().description || "",
      barcode: doc.data().barcode || "",
      quantity: doc.data().quantity || 1,
      image: doc.data().imageUrl || "",
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

export async function quickRemove(item: ItemData, userId: string) {
  const docRef = doc(db, "users", userId as string, "items", item.id as string);

  await updateDoc(docRef, {
    quantity: item.quantity - 1 || 0,
  });
  item.quantity = item.quantity - 1;
}

export const getData = async (uid: string | null) => {
  const response = await fetchData(uid!);
  return response!;
};

export const deleteItem = async (id: string, userId: string | null) => {
  if (!userId) {
    console.error("User not authenticated.");
    return;
  }

  try {
    const itemRef = doc(db, "users", userId, "items", id);
    const itemSnapshot = await getDoc(itemRef);
    let imageDeletePromise = Promise.resolve(); 
    if (itemSnapshot.exists()) {
      const itemData = itemSnapshot.data();
      const imageUrl = itemData.imageUrl;

      if (imageUrl) {
        // Extract the file path from the image URL
        const storagePath = decodeURIComponent(
          new URL(imageUrl).pathname
        ).replace(/^\/v0\/b\/[^/]+\/o\//, "");

        const fileRef = ref(storage, storagePath);

        // Delete the image from Firebase Storage (store the promise)
        imageDeletePromise = deleteObject(fileRef)
          .then(() => console.log(`Image deleted: ${storagePath}`))
          .catch((error) => console.error("Error deleting image: ", error));
      }
    }

    await imageDeletePromise;
    await deleteDoc(itemRef);
    console.log(`Item with ID ${id} deleted`);

    const updatedData = await getData(userId);
    return updatedData;
  } catch (error) {
    console.error("Error deleting document or image: ", error);
  }
};

export const removeFromList = async (id: string, userId: string) => {
  if (!userId) return;
  try {
    await deleteDoc(doc(db, "users", userId, "list", id));
    fetchListData(userId);
    console.log(id);
  } catch (error) {
    console.error("Error removing from list: ", error);
  }
};

export const fetchListData = async (uid: string): Promise<ItemData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users", uid, "list"));
    const fetchedList: ItemData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ItemData[];
    return fetchedList;
  } catch (error) {
    console.error("Error fetching list data: ", error);
    return [];
  }
};
