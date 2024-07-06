import {createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Layout from './components/layout';
import Home from './pages/home';
import NotFound from './pages/NotFound';
import Signup from './pages/user/Signup';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import ProductNew from './pages/product/ProductNew';
import OrderList from './pages/order/OrderList';
import User from './pages/user';
import Login from './pages/user/Login';
import Product from './pages/product';
import Order from './pages/order';
import OrderNew from './pages/order/OrderNew';
import UserInfo from './pages/user/UserInfo';
import Chat from './pages/chat';
import CreateRoom from './pages/chat/CreateRoom';
import JoinRoom from './pages/chat/ChatRoom';

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />

      <Route path="/products" element={<Product />}>
        <Route index element={<ProductList />} />
        <Route path="new" element={<ProductNew />} />
        <Route path=":_id" element={<ProductDetail />} />
      </Route>

      <Route path="/orders" element={<Order />}>
        <Route index element={<OrderList />} />
        <Route path="new" element={<OrderNew />} />
        <Route path=":_id" element={<ProductDetail />} />
      </Route>

      <Route path="/users" element={<User />}>
        <Route path="new" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path=":_id" element={<UserInfo />} />
      </Route>
      
      <Route path="/chat" element={<Chat />}>
        <Route index element={<CreateRoom />} />
        <Route path=":roomId" element={<JoinRoom />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default Router;