import Footer from "./Footer";
import Header from "./Header";
import { Outlet } from 'react-router-dom';

const Layout = function(){
  return (
    <div className="container">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;