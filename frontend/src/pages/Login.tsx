import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const { data } = await api.post("/auth/login", values);
      localStorage.setItem("token", data.access_token);
      message.success("Muvaffaqiyatli kirdingiz");
      navigate("/drugs");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Kirishda xatolik");
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <Card title="Admin panelga kirish" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Emailni kiriting" }]}
          >
            <Input placeholder="admin@admin.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, min: 6, message: "Parol kamida 6 ta belgi bo‘lishi kerak" }]}
          >
            <Input.Password placeholder="******" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Kirish
          </Button>
        </Form>
      </Card>
    </div>
  );
}
