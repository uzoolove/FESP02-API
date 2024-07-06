import { Outlet } from "react-router-dom";

const Buy = function(){
  return (
    <main>
      <h1>구매</h1>
      <Outlet />
    </main>
  );
};

export default Buy;