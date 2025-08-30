import React from "react";
import { Layout, Menu, Button, theme } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;

export default function App() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = location.pathname.startsWith("/drugs") ? "drugs" : "dashboard";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, margin: 16, color: "#fff", fontWeight: 700 }}>Admin</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="drugs">
            <Link to="/drugs">Dorilar</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{ background: token.colorBgContainer, display: "flex", justifyContent: "flex-end", margin: "16px" }}
        >
          <Button onClick={logout}>Chiqish</Button>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div style={{ padding: 24, background: token.colorBgContainer, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
