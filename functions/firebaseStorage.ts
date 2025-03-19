
import { storage } from "@/app/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage under the user's folder.
 * @param userId - The user's unique ID.
 * @param file - The file to upload.
 * @returns The download URL of the uploaded file.
 */
export const uploadFile = async (userId: string, file: File): Promise<string | null> => {
  if (!userId) {
    console.error("User not authenticated.");
    return null;
  }

  const storageRef = ref(storage, `users/${userId}/images/${Date.now()+file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("File uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};
