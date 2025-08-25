import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Select, Upload, Card } from "antd";
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
  const [search, setSearch] = useState(""); // ← новое состояние для поиска

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/drugs");
      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setData(list);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Ошибка загрузки");
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
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    try {
      if (editing) {
        await api.put(`/drugs/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Обновлено");
      } else {
        await api.post("/drugs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Создано");
      }
      setOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Ошибка сохранения (нужна роль ADMIN)");
    }
  };

  const handleDelete = async (record: Drug) => {
    Modal.confirm({
      title: "Удалить препарат?",
      content: `Вы уверены, что хотите удалить "${record.name}"?`,
      onOk: async () => {
        try {
          await api.delete(`/drugs/${record.id}`);
          message.success("Удалено");
          fetchData();
        } catch (e: any) {
          message.error(e?.response?.data?.message || "Ошибка удаления (нужна роль ADMIN)");
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Название", dataIndex: "name" },
      { title: "Описание", dataIndex: "description" },
      { title: "Тип", dataIndex: "type" },
      { title: "Род (genus)", dataIndex: "genus" },
      { title: "Дозировка", dataIndex: "dosage" },
      { title: "Производитель", dataIndex: "manufacturer" },
      { title: "Цена", dataIndex: "price", render: (v: any) => v ?? "" },
      {
        title: "Изображения",
        dataIndex: "images",
        render: (images: string[]) =>
          images?.length
            ? images.map((img, i) => (
                <img key={i} src={`${API_URL}${img}`} alt="drug" style={{ width: 50, marginRight: 5 }} />
              ))
            : null,
      },
      {
        title: "Действия",
        render: (_: any, record: Drug) => (
          <Space>
            <Button onClick={() => openEdit(record)}>Редактировать</Button>
            <Button danger onClick={() => handleDelete(record)}>
              Удалить
            </Button>
          </Space>
        ),
        width: 220,
      },
    ],
    []
  );

  // Фильтрация по имени (без изменений в API)
  const filteredData = useMemo(() => {
    return data.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", paddingBottom: 15 }}>
        <Input
          placeholder="Поиск по имени"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, flex: "1 1 auto", minWidth: 180 }}
        />
        <Button type="primary" onClick={openCreate}>
          Добавить препарат
        </Button>
        <Button onClick={fetchData}>Обновить</Button>
      </div>

      <Table rowKey="id" scroll={{ x: true }} loading={loading} dataSource={filteredData} columns={columns as any} />

      <Modal
        open={open}
        title={editing ? "Редактировать препарат" : "Создать препарат"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Сохранить"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Цена">
            <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="type" label="Тип">
            <Select placeholder="Выберите тип">
              <Select.Option value="tablet">Таблетки</Select.Option>
              <Select.Option value="capsule">Капсулы</Select.Option>
              <Select.Option value="syrup">Сироп</Select.Option>
              <Select.Option value="other">Другое</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="genus" label="Род (genus)">
            <Input />
          </Form.Item>
          <Form.Item name="dosage" label="Дозировка">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="Производитель">
            <Input />
          </Form.Item>
          <Form.Item label="Изображения">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Загрузить</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
