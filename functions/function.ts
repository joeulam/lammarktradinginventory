// const addToList = async (item: ItemData) => {
//   showListInput()
//   // Wait until show input is done
//   if (!userId) return;
//   try {
//     await addDoc(collection(db, "users", userId, "list"), {
//       name: item.name,
//       company: item.company,
//       cost: item.cost,
//       description: item.description || "",
//       barcode: item.barcode || "",
//       quantity: item.quantity || 0,
//     });
//     fetchListData(userId);
//   } catch (error) {
//     console.error("Error adding to list: ", error);
//   }
// };