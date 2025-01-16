'use client';
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Modal, Card, List } from 'antd';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface ItemData {
  id: string;
  name: string;
  company: string;
  cost: number;
  description: string;
  barcode: string;
  photo: string;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<ItemData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
    form.resetFields();
    setUploadedFile(null);
  };

  const onFinish = async (values: Partial<ItemData>) => {
    if (!userId) {
      console.error('User not authenticated.');
      return;
    }

    try {
      if (!values.name || !values.cost || !values.company) {
        throw new Error('Name, Cost, and Company are required fields.');
      }

      const docRef = await addDoc(collection(db, 'users', userId, 'items'), {
        name: values.name,
        company: values.company,
        cost: values.cost,
        description: values.description || '',
        barcode: values.barcode || '',
        photo: uploadedFile || '',
      });

      console.log('Document written with ID: ', docRef.id);

      form.resetFields();
      setUploadedFile(null);
      setIsModalOpen(false);
      fetchData(userId); // Refresh data for the current user
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const fetchData = async (uid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users', uid, 'items'));
      const fetchedData: ItemData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '',
        company: doc.data().company || '',
        cost: doc.data().cost || 0,
        description: doc.data().description || '',
        barcode: doc.data().barcode || '',
        photo: doc.data().photo || '',
      }));
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId) {
      console.error('User not authenticated.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId, 'items', id));
      console.log(`Item with ID ${id} deleted`);
      fetchData(userId); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Add new item
      </Button>
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
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: 'Please enter the company' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cost"
            label="Cost"
            rules={[{ required: true, message: 'Please enter the cost' }]}
          >
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
        grid={{ gutter: 16, column: 2 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.name}
              actions={[
                <Button key="default" type="link" danger onClick={() => deleteItem(item.id)}>
                  Delete
                </Button>,
              ]}
            >
              <p><strong>Company:</strong> {item.company}</p>
              <p><strong>Cost:</strong> ${item.cost}</p>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Barcode:</strong> {item.barcode}</p>
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

export default App;
