import { Outlet } from 'react-router';

const User = function(){
  return (
    <main>
      <h1>회원</h1>
      <Outlet />
    </main>
  );
};

export default User;