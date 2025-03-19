"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Card,
  List,
  Image,
  Typography,
  Spin,
  // Upload,
} from "antd";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { ItemData } from "@/functions/dataType";
import {
  deleteItem,
  fetchListData,
  getData,
  quickRemove,
  removeFromList,
} from "../../functions/helpFunction";
import { BarcodeScanner } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";
import { CameraOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Upload } from "antd";
import type { UploadFile } from "antd";
import ImgCrop from "antd-img-crop";
import { uploadFile } from "@/functions/firebaseStorage";
import { LoadingOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [form] = Form.useForm();
  const [toDoList] = Form.useForm();
  const [toDoListAdd] = Form.useForm();
  const [data, setData] = useState<ItemData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentObjectId, setCurrentObjectId] = useState<string | null>(null);
  const [listData, setListData] = useState<ItemData[]>([]);
  const [listDataModel, setListDataModel] = useState(false);
  const [currentData, setCurrentData] = useState<ItemData[]>();
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state

  // Handle authentication state changes
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid); // Set the userId if the user is logged in
        setData(await getData(user.uid));
        // Fetch data for the logged-in user
        setListData(await fetchListData(user.uid));
      } else {
        setUserId(null); // Clear userId if no user is logged in
        setData([]); // Clear data
      }
    });
    return () => unsubscribe(); // Clean up the subscription
  }, []);

  const showModal = () => setIsModalOpen(true);
  const showListModal = () => setIsListModalOpen(true);
  const handleCancelList = () => {
    setIsListModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setListDataModel(false);
    setBarcode("");
    form.resetFields();
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.2, // Max file size (e.g., 0.2MB)
      maxWidthOrHeight: 800, // Max width or height
      useWebWorker: true, // Improves performance
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file; // Return original file if compression fails
    }
  };
  
  const onFinish = async (values: Partial<ItemData>) => {
    setLoading(true); // Show loading spinner
  
    if (!userId) {
      console.error("User not authenticated.");
      setLoading(false);
      return;
    }
  
    try {
      if (!values.name || !values.cost) {
        throw new Error("Name, Cost, and Company are required fields.");
      }
  
      let imageUrl = "";
  
      // If a file is selected, compress and upload it
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj as File;
        const compressedFile = await compressImage(file); // Compress the image
        imageUrl = (await uploadFile(userId, compressedFile)) || ""; // Upload compressed file
      }
  
      const itemData = {
        name: values.name,
        company: values.company,
        cost: values.cost,
        description: values.description || "",
        barcode: values.barcode || "",
        quantity: values.quantity || 0,
        imageUrl,
      };
  
      if (!isEditing) {
        const docRef = await addDoc(collection(db, "users", userId, "items"), itemData);
        console.log("Document written with ID: ", docRef.id);
      } else {
        const docRef = doc(db, "users", userId, "items", currentObjectId as string);
        await updateDoc(docRef, itemData);
        setIsEditing(false);
      }
  
      // Reset state
      setBarcode("");
      form.resetFields();
      setFileList([]); // Clear file list
      setIsModalOpen(false);
      setCurrentObjectId("");
  
      // Refresh data
      setData(await getData(userId));
      
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false); // Hide spinner after processing
    }
  };
  const editCard = (item: ItemData) => {
    form.setFieldsValue(item);
    setCurrentObjectId(item.id);
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const removeOneEntry = async (item: ItemData) => {
    quickRemove(item, userId as string);
    setData(await getData(userId!));
  };

  const showListInput = (item: ItemData[]) => {
    setListDataModel(true);
    setCurrentData(item);
  };

  const addToList = async (item: Partial<ItemData>) => {
    // Wait until show input is done
    if (!userId) return;
    try {
      await addDoc(collection(db, "users", userId, "list"), {
        name: (currentData as Partial<ItemData>).name,
        company: (currentData as Partial<ItemData>).company,
        cost: (currentData as Partial<ItemData>).cost,
        description: item.description || "",
        barcode: (currentData as Partial<ItemData>).barcode || "",
        quantity: item.quantity || 0,
      });
      setListData(await fetchListData(userId));
      setCurrentData(undefined);
      setListDataModel(false);
      setBarcode("");
      form.resetFields();
    } catch (error) {
      console.error("Error adding to list: ", error);
    }
  };

  const handleQuickAdd = async (values: Partial<ItemData>) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "users", userId, "list"), {
        name: values.name || "Unnamed Item",
        description: values.description || "",
        quantity: values.quantity || 1,
      });
      toDoListAdd.resetFields();
      setListData(await fetchListData(userId));
      setIsQuickAddOpen(false);
    } catch (error) {
      console.error("Error adding quick item: ", error);
    }
  };

  const handleScan = (scannedValue: string) => {
    setBarcode(scannedValue);
    setScannerOpen(false); // Close scanner after scan
  };

  const { Title } = Typography;

  function logout() {
    try {
      signOut(auth);
      router.push("/");
    } catch (e) {
      console.log(e);
    }
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;

    if (!src && file.originFileObj) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }

    if (src) {
      const imgWindow = window.open("");
      if (imgWindow) {
        imgWindow.document.write(`<img src="${src}" style="max-width:100%;"/>`);
      }
    }
  };

  return (
    <>
      <div style={{ padding: "2%" }}>
        <Title>Current Inventory</Title>
        <div className="w-full lg:w-[80vw] mx-auto">
          <Modal
            title="Add New Item"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  zIndex: 10,
                }}
              >
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                />
              </div>
            )}
              <Form
                {...layout}
                form={form}
                name="itemForm"
                onFinish={onFinish}
                style={{ padding: 0, margin: 0 }}
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
                  rules={[
                    { required: true, message: "Please enter the company" },
                  ]}
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
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    style={{ marginTop: "3vh" }}
                    onClick={() => setScannerOpen(!scannerOpen)}
                  >
                    {scannerOpen ? "Close Scanner" : "Scan Barcode"}
                  </Button>
                  {scannerOpen && (
                    <BarcodeScanner
                      options={{
                        delay: 500,
                        formats: [
                          "code_128",
                          "code_39",
                          "code_93",
                          "codabar",
                          "ean_13",
                          "ean_8",
                          "itf",
                          "qr_code",
                          "upc_a",
                          "upc_e",
                        ],
                      }}
                      onCapture={(e) => handleScan(e[0].rawValue)}
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <ImgCrop rotationSlider>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      beforeUpload={() => false} // Prevent auto upload
                      onChange={({ fileList: newFileList }) =>
                        setFileList(newFileList)
                      }
                      onPreview={onPreview}
                    >
                      {fileList.length < 1 && "+ Upload"}
                    </Upload>
                  </ImgCrop>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={() => setLoading(true)}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            
          </Modal>

          <List
            style={{ marginTop: "10vh" }}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3>{item.name}</h3>
                      <Button onClick={() => removeOneEntry(item)}>
                        Quick Remove
                      </Button>
                    </div>
                  }
                  actions={[
                    <Button
                      key="default"
                      type="link"
                      danger
                      onClick={async () => {
                        await deleteItem(item.id, userId);
                        setData(await getData(userId));
                      }}
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
                      onClick={() =>
                        showListInput(item as unknown as ItemData[])
                      }
                    >
                      Add to list
                    </Button>,
                  ]}
                >
                  <div>
                    <div>
                      <p>
                        <strong>Company:</strong> {item.company}
                      </p>
                      <p>
                        <strong>Cost:</strong> ${item.cost}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                    </div>
                    <Image width={200} src={item.image} alt="no image" />
                  </div>
                </Card>
              </List.Item>
            )}
          />
          <Modal
            title="List Of Item"
            open={isListModalOpen}
            onCancel={handleCancelList}
            footer={null}
          >
            <List
              dataSource={listData}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key=""
                      onClick={async () => {
                        await removeFromList(item.id, userId!);
                        setListData(await fetchListData(userId!));
                      }}
                    >
                      Remove
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <div>Quantity: {item.quantity}</div>
                </List.Item>
              )}
            />
            <Button
              onClick={() => {
                setIsQuickAddOpen(!isQuickAddOpen);
              }}
            >
              Quick Add
            </Button>
          </Modal>
          <Modal
            title="Quick Add Item"
            open={isQuickAddOpen}
            onCancel={() => setIsQuickAddOpen(false)}
            footer={null}
          >
            <Form form={toDoListAdd} onFinish={handleQuickAdd}>
              <Form.Item name="name" label="Name">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea />
              </Form.Item>
              <Form.Item name="quantity" label="Quantity">
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Button type="primary" onClick={showModal}>
              Add new item
            </Button>
            <Button type="primary" onClick={showListModal}>
              Check list
            </Button>

            <Modal
              title="Add to list"
              open={listDataModel}
              onCancel={handleCancel}
              footer={null}
            >
              <Form
                {...layout}
                form={toDoList}
                name="itemForm"
                onFinish={addToList}
                style={{ maxWidth: 600 }}
              >
                <Form.Item name="quantity" label="Quantity">
                  <InputNumber />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
        <Button onClick={logout}>Log Out</Button>
      </div>
    </>
  );
};

export default App;
