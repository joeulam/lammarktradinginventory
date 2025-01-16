'use client';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Modal, Upload, Card, List } from 'antd';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UploadChangeParam } from 'antd/es/upload';

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

  const handleUploadChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done' && info.file.originFileObj) {
      const mockUrl = URL.createObjectURL(info.file.originFileObj);
      setUploadedFile(mockUrl);
    }
  };

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setUploadedFile(null);
  };

  const onFinish = async (values: Omit<ItemData, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'items'), {
        ...values,
        photo: uploadedFile || '',
      });
      console.log('Document written with ID: ', docRef.id);
      form.resetFields();
      setUploadedFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
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
    try {
      await deleteDoc(doc(db, 'items', id));
      console.log(`Item with ID ${id} deleted`);
      fetchData(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <Form.Item
            name="photo"
            label="Photo"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              action="/upload.do"
              listType="picture-card"
              onChange={handleUploadChange}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <List
        grid={{ gutter: 16, column: 4 }}
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
              {item.photo && <img src={item.photo} alt="Uploaded" style={{ width: '100%' }} />}
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

export default App;
