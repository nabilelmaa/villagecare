import Header from "./Header";
import Footer from "./Footer";
import SideBar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="flex">
        <SideBar />
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
