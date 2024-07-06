import { Link } from "react-router-dom";

const UserInfo = function(){
  return (
    <div>
      <h1>회원 정보</h1>
      <div>
        <ul>
          <li><Link to="/orders">구매 내역</Link></li>
          <li><Link to="">회원 정보 수정</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default UserInfo;