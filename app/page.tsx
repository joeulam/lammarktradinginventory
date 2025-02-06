'use client';

import React from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import type { FormProps } from 'antd';
import { Button, Form, Input } from 'antd';
import { useRouter } from "next/navigation";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const App: React.FC = () => {
  const router = useRouter(); // Call useRouter inside the component body

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
    signInWithEmailAndPassword(auth, values.username!, values.password!)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User:', user);
        router.push("/dashboard"); // Use router here
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 400, width: '100%' }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
      <Form.Item<FieldType>
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
    </div>
  );
};

export default App;
