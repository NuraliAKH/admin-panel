import { Layout, Menu, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./layout.css";

const { Header, Content, Sider } = Layout;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = location.pathname.startsWith("/drugs") ? "dashboard" : "";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Header tashqarida bo‘ladi */}
      <Header className="sidebar-mobile">
        <div className="mobile-header-content">
          <span className="logo-text">Humo pharm</span>
          <Button
            onClick={logout}
            style={{
              backgroundColor: "#fff",
              color: "#D93D40",
              borderRadius: 10,
            }}
          >
            Chiqish
          </Button>
        </div>
      </Header>

      <Layout className="layout-mobile">
        <Content style={{ margin: "0px" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      {/* Desktop Layout */}
      <Layout className="desktop-layout" style={{ minHeight: "100vh" }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            backgroundColor: "#D93D40",
            borderRadius: 20,
            margin: "24px 0 24px 24px",
            padding: "20px 0",
            position: "relative",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ backgroundColor: "transparent", width: "100%", padding: 10 }}
            items={[
              {
                key: "dashboard",
                label: <Link to="/drugs">Dashboard</Link>,
                style:
                  selectedKey === "dashboard"
                    ? {
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: 15,
                        textAlign: "center",
                        fontSize: 16,
                      }
                    : {},
              },
            ]}
          />
          <Button
            block
            onClick={logout}
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              width: "calc(100% - 40px)",
            }}
          >
            <LogoutOutlined /> Chiqish
          </Button>
        </Sider>

        <Layout>
          <Content style={{ margin: "0px" }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
