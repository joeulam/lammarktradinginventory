'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import type { FormProps } from 'antd';
import { Button, Form, Alert, Input } from 'antd';
import { useRouter } from "next/navigation";

type FieldType = {
  email?: string;
  password?: string;
};

const SignUp: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
    setError(null); // Reset error state
    createUserWithEmailAndPassword(auth, values.email!, values.password!)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User:', user);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.error('Error:', error.message);
        setError(error.message);
      });
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form
        name="signup"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 400, width: '100%' }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
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
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUp;