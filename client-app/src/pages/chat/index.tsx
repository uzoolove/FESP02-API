import { Outlet } from 'react-router';

const Product = function(){

  return (
    <main>
      <h1>채팅</h1>
      <Outlet />

    </main>
  );
};

export default Product;