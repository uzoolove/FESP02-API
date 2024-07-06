import { useLocation } from "react-router";

const NotFound = function(){
  const location = useLocation();
  
  return (
    <div className="card card-body">
      <br/><br/><br/>
      <h3>존재하지 않는 페이지입니다.</h3>
      <p>요청 페이지 : {location.pathname}</p>
    </div>
  );
};

export default NotFound;