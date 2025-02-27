import { ItemData } from "@/functions/dataType";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../app/firebase";





export async function fetchData(uid: string){
  try {
    const querySnapshot = await getDocs(
      collection(db, "users", uid, "items")
    );
    const fetchedData: ItemData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      company: doc.data().company || "",
      cost: doc.data().cost || 0,
      description: doc.data().description || "",
      barcode: doc.data().barcode || "",
      quantity: doc.data().quantity || 1,
    }));
    return fetchedData
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};


export async function quickRemove(item: ItemData, userId: string){
  const docRef = doc(
    db,
    "users",
    userId as string,
    "items",
    item.id as string
  );

  await updateDoc(docRef, {
    quantity: item.quantity - 1 || 0,
  });
  item.quantity = item.quantity - 1;
};