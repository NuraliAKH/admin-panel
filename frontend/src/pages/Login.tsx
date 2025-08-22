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
      message.success("Успешный вход");
      navigate("/drugs");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Ошибка входа");
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <Card title="Вход в админку" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="admin@admin.com" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="******" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
