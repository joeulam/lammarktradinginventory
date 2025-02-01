"use client";
import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Modal, Card, List } from "antd";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

interface ItemData {
  id: string;
  name: string;
  company: string;
  cost: number;
  description: string;
  barcode: string;
  quantity: number;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState<ItemData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentObjectId, setCurrentObjectId] = useState<string | null>(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the userId if the user is logged in
        fetchData(user.uid); // Fetch data for the logged-in user
      } else {
        setUserId(null); // Clear userId if no user is logged in
        setData([]); // Clear data
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, []);

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: Partial<ItemData>) => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      if (!values.name || !values.cost) {
        throw new Error("Name, Cost, and Company are required fields.");
      }
      if (!isEditing) {
        const docRef = await addDoc(collection(db, "users", userId, "items"), {
          name: values.name,
          company: values.company,
          cost: values.cost,
          description: values.description || "",
          barcode: values.barcode || "",
          quantity: values.quantity || 0,
        });
        console.log("Document written with ID: ", docRef.id);
      } else {
        const docRef = doc(
          db,
          "users",
          userId as string,
          "items",
          currentObjectId as string
        );
        await updateDoc(docRef, {
          name: values.name,
          company: values.company,
          cost: values.cost,
          description: values.description || "",
          barcode: values.barcode || "",
          quantity: values.quantity || 0,
        });
        setIsEditing(false);
      }
      form.resetFields();
      setIsModalOpen(false);
      setCurrentObjectId("");
      fetchData(userId); // Refresh data for the current user
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const fetchData = async (uid: string) => {
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
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId, "items", id));
      console.log(`Item with ID ${id} deleted`);
      fetchData(userId); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const editCard = (item: ItemData) => {
    form.setFieldsValue(item);
    setCurrentObjectId(item.id);
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const quickRemove = async (item: ItemData) => {
    const docRef = doc(
      db,
      "users",
      userId as string,
      "items",
      item.id as string
    );
    
    await updateDoc(docRef, {
      quantity: item.quantity-1 || 0,
    });
    item.quantity = item.quantity - 1
    console.log(item.quantity)
    fetchData(userId!);
  }
  return (
    <>
      <div className="w-full lg:w-[80vw] mx-auto">
        <Modal
          title="Add New Item"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            {...layout}
            form={form}
            name="itemForm"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter the name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: "Please enter the company" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="cost"
              label="Cost"
              rules={[{ required: true, message: "Please enter the cost" }]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item name="quantity" label="Quantity">
              <InputNumber />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="barcode" label="Barcode">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <List
          style={{ marginTop: "10vh" }}
          grid={{ gutter: 16, xs: 1,
            sm: 2, }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Card
                title={
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>{item.name}</h3>
                    <Button onClick={() => quickRemove(item)}>Quick Remove</Button>
                  </div>
                }
                
                actions={[
                  <Button
                    key="default"
                    type="link"
                    danger
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </Button>,
                  <Button
                    key="default"
                    type="link"
                    onClick={() => editCard(item)}
                  >
                    Edit
                  </Button>,
                  <Button
                    key="default"
                    type="link"
                    onClick={() => console.log("add")}
                  >
                    Add to list
                  </Button>,
                ]}
              >
                <p>
                  <strong>Company:</strong> {item.company}
                </p>
                <p>
                  <strong>Cost:</strong> ${item.cost}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
              </Card>
            </List.Item>
          )}
        />
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button type="primary" onClick={showModal}>
            Add new item
          </Button>
          <Button type="primary" onClick={showModal}>
            Check list
          </Button>
        </div>
      </div>
    </>
  );
};

export default App;
