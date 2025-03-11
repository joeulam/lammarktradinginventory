'use client';

import React from 'react';
import { useRouter } from "next/navigation";
import { Button } from 'antd';

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      gap: '20px'
    }}>
      <h1>Welcome</h1>
      <Button type="primary" onClick={() => router.push("/login")}>Login</Button>
      <Button type="default" onClick={() => router.push("/signUp")}>Sign Up</Button>
    </div>
  );
};

export default Home;
