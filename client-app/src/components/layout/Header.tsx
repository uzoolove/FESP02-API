import { Link } from "react-router-dom";
import { userState } from "../../recoil/user/atoms";
import { useRecoilState } from "recoil";

const Header = function(){
  const [user, setUser] = useRecoilState(userState);

  const handleLogout = function(e: React.MouseEvent<HTMLElement>){
    e.preventDefault();
    setUser(null);
    delete localStorage.accessToken;
    delete localStorage.refreshToken;
  }

  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="/">오늘의 토이</Link></li>
            <li><Link to="/products?menu=new">신상품</Link></li>
            <li><Link to="/products?menu=kidult">키덜트 존</Link></li>
            <li><Link to="/products?menu=best">베스트</Link></li>
            <li><Link to="/chat">채팅</Link></li>
            { user?.name ?
              <li>
                <ul>
                  <li><Link to={`/users/${user._id}`}>{user.name}님 반갑습니다.({user.membershipClass})</Link></li>
                  <li><Link to="" onClick={ handleLogout }>로그아웃</Link></li>
                </ul>
              </li>
            :
              <li><Link to="/users/login">로그인</Link></li>
            }            
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;