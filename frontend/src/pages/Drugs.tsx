import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form, Input, InputNumber, Space, message, Select, Upload, Card } from "antd";
import { DeleteOutlined, PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
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

const drugCategories = [
  { value: "Tabletkalar", label: "Tabletka" },
  { value: "Kapsulalar", label: "Kapsula" },
  { value: "Siroplar", label: "Sirop" },
  { value: "Svichalar", label: "Svicha" },
  { value: "Tomchilar", label: "Tomchi" },
  { value: "Parashok", label: "Parashok" },
  { value: "Mazlar", label: "Maz" },
  { value: "Boshqalar", label: "Boshqa" },
];

export default function Drugs() {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

  const [data, setData] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Drug | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [search, setSearch] = useState(""); // qidiruv uchun
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
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

  const openCreate = (type?: string) => {
    setEditing(null);
    setFileList([]);
    form.resetFields();
    if (type) {
      form.setFieldsValue({ type });
    }
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

  const groupedData = useMemo(() => {
    const filtered = filteredData.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));
    return filtered.reduce((acc: Record<string, Drug[]>, item) => {
      const category = item.type || "Boshqa";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [data, search]);

  return (
    <div>
      <div
        className="toolbar"
        style={{
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          padding: 15,
          borderRadius: 15,
          marginBottom: 15,
        }}
      >
        <Input
          placeholder="Qidiruv"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: 400,
            height: 45,
            flex: "1 1 auto",
            minWidth: 180,
            borderRadius: 15,
            background: "#EAEBEC",
          }}
        />
        <div style={{ fontWeight: 500, padding: "14px 30px", borderRadius: 15, height: 45, background: "#EAEBEC" }}>
          {time}
        </div>
      </div>

      {Object.keys(groupedData).length === 0 && (
        <div>
          {" "}
          <p style={{ textAlign: "center", color: "red" }}>Hech qanday dori topilmadi</p>
        </div>
      )}
      {drugCategories.map(({ value: category, label }) => {
        const items = groupedData[category] ?? [];
        const isExpanded = expandedCategories[category];
        const visibleItems = isExpanded ? items : items.slice(0, 3);

        return (
          <Card
            key={category}
            title={category}
            bodyStyle={{ padding: 0 }}
            headStyle={{ padding: 0 }}
            style={{ marginBottom: 20, background: "#f5f5f5", border: "none", padding: 0 }}
            extra={
              <Button
                type="primary"
                style={{ background: "#D93D40", border: "none" }}
                onClick={() => openCreate(category)}
              >
                <PlusCircleOutlined /> Yangi dori yaratish
              </Button>
            }
          >
            {items.length === 0 ? (
              <p style={{ textAlign: "center", color: "red", padding: "10px 0" }}>Hech qanday dori topilmadi</p>
            ) : (
              <>
                {visibleItems.map(drug => (
                  <div
                    key={drug.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 15px",
                      marginBottom: 10,
                      borderRadius: 10,
                      background: "#fff",
                    }}
                  >
                    <span>#{drug.name}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        onClick={() => openEdit(drug)}
                        style={{ background: "green", color: "#fff", border: "none" }}
                      >
                        qo‘shish
                      </Button>
                      <Button danger onClick={() => handleDelete(drug)}>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>
                ))}

                {items.length > 3 && (
                  <Button
                    onClick={() => toggleCategory(category)}
                    style={{
                      fontWeight: "bold",
                      marginTop: 10,
                      color: "#D93D40",
                      background: "transparent",
                      width: "100%",
                      border: "1px solid #D93D40",
                    }}
                  >
                    {isExpanded ? "Yashirish" : "Yana ko‘rish"}
                  </Button>
                )}
              </>
            )}
          </Card>
        );
      })}

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
          <Form.Item name="type" label="Turi">
            <Select placeholder="Dori turini tanlang">
              <Select.Option value="Tabletkalar">Tabletka</Select.Option>
              <Select.Option value="Kapsulalar">Kapsula</Select.Option>
              <Select.Option value="Siroplar">Sirop</Select.Option>
              <Select.Option value="Svichalar">Svicha</Select.Option>
              <Select.Option value="Tomchilar">Tomchi</Select.Option>
              <Select.Option value="Parashok">Parashok</Select.Option>
              <Select.Option value="Mazlar">Maz</Select.Option>
              <Select.Option value="Boshqalar">Boshqa</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="genus" label="Tarkibi">
            <Input />
          </Form.Item>
          <Form.Item name="dosage" label="Qo`llanishi">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="Nojo‘ ta’siri">
            <Input />
          </Form.Item>
          <Form.Item label="Rasmlar">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              listType="picture"
              multiple
            >
              <Button icon={<UploadOutlined />}>Yuklash</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
