import Header from "./Header";
import Footer from "./Footer";
import SideBar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-grow">
        <SideBar />
        <main className="flex-grow md:ml-20 lg:ml-64 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;