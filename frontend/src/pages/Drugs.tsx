import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import api from "../api";
import { Drug } from "../types";

type FormValues = {
  name: string;
  description?: string;
  price?: number;
  type?: string;
  genus?: string;
  dosage?: string;
  manufacturer?: string;
  images?: UploadFile[];
};

export default function Drugs() {
  const API_URL = import.meta.env.VITE_API_URL ?? "https://humopharmgroup.uz/api";

  const [data, setData] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Drug | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [search, setSearch] = useState(""); // qidiruv uchun

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/drugs");
      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setData(list);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFileList([]);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Drug) => {
    setEditing(record);
    setFileList(
      (record.images || []).map((url, index) => ({
        uid: String(index),
        name: url.split("/").pop() || `image-${index}`,
        status: "done",
        url,
      }))
    );
    form.setFieldsValue({
      name: record.name,
      description: record.description || "",
      price: record.price || undefined,
      type: record.type || "",
      genus: record.genus || "",
      dosage: record.dosage || "",
      manufacturer: record.manufacturer || "",
      images: record.images || [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) formData.append("description", values.description);
    if (values.price !== undefined) formData.append("price", String(values.price));
    if (values.type) formData.append("type", values.type);
    if (values.genus) formData.append("genus", values.genus);
    if (values.dosage) formData.append("dosage", values.dosage);
    if (values.manufacturer) formData.append("manufacturer", values.manufacturer);

    fileList.forEach(file => {
      const realFile = file.originFileObj as File;
      if (realFile) {
        formData.append("images", realFile, realFile.name);
      }
    });

    try {
      if (editing) {
        await api.put(`/drugs/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Yangilandi");
      } else {
        await api.post("/drugs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Yaratildi");
      }
      setOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Saqlashda xatolik (ADMIN roli kerak)");
    }
  };

  const handleDelete = async (record: Drug) => {
    Modal.confirm({
      title: "Dori vositasini o‘chirish?",
      content: `"${record.name}" dori vositasini o‘chirishni xohlaysizmi?`,
      onOk: async () => {
        try {
          await api.delete(`/drugs/${record.id}`);
          message.success("O‘chirildi");
          fetchData();
        } catch (e: any) {
          message.error(e?.response?.data?.message || "O‘chirishda xatolik (ADMIN roli kerak)");
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Nomi", dataIndex: "name" },
      { title: "Tavsif", dataIndex: "description" },
      { title: "Turi", dataIndex: "type" },
      { title: "Rodi (genus)", dataIndex: "genus" },
      { title: "Dozalash", dataIndex: "dosage" },
      { title: "Ishlab chiqaruvchi", dataIndex: "manufacturer" },
      { title: "Narxi", dataIndex: "price", render: (v: any) => v ?? "" },
      {
        title: "Rasmlar",
        dataIndex: "images",
        render: (images: string[]) =>
          images?.length
            ? images.map((img, i) => (
                <img key={i} src={`${API_URL}${img}`} alt="drug" style={{ width: 50, marginRight: 5 }} />
              ))
            : null,
      },
      {
        title: "Amallar",
        render: (_: any, record: Drug) => (
          <Space>
            <Button onClick={() => openEdit(record)}>Tahrirlash</Button>
            <Button danger onClick={() => handleDelete(record)}>
              O‘chirish
            </Button>
          </Space>
        ),
        width: 220,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", paddingBottom: 15 }}>
        <Input
          placeholder="Nomi bo‘yicha qidirish"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, flex: "1 1 auto", minWidth: 180 }}
        />
        <Button type="primary" onClick={openCreate}>
          Dori qo‘shish
        </Button>
        <Button onClick={fetchData}>Yangilash</Button>
      </div>

      <Table rowKey="id" scroll={{ x: true }} loading={loading} dataSource={filteredData} columns={columns as any} />

      <Modal
        open={open}
        title={editing ? "Dorini tahrirlash" : "Dori qo‘shish"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Saqlash"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nomi" rules={[{ required: true, message: "Dori nomini kiriting" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Narxi">
            <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="type" label="Turi">
            <Select placeholder="Dori turini tanlang">
              <Select.Option value="tablet">Tabletka</Select.Option>
              <Select.Option value="capsule">Kapsula</Select.Option>
              <Select.Option value="syrup">Sirop</Select.Option>
              <Select.Option value="other">Boshqa</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="genus" label="Rodi (genus)">
            <Input />
          </Form.Item>
          <Form.Item name="dosage" label="Dozalash">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="Ishlab chiqaruvchi">
            <Input />
          </Form.Item>
          <Form.Item label="Rasmlar">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Yuklash</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
