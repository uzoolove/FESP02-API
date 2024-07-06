import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { userState } from '../../recoil/user/atoms';
import { useRecoilValue, useSetRecoilState } from "recoil";
import useCustomAxios from '../../hooks/useCustomAxios';
import { codeState } from "../../recoil/code/atoms";

interface LoginRes {
  data: {
    item: {
      _id: number,
      email: string,
      name: string,
      phone: string,
      address: string,
      type: 'user' | 'seller' | 'admin',
      extra: {
        membershipClass: string;
      };
      token: {
        accessToken: string;
        refreshToken: string;
      }
    }
  }
  ok: 0 | 1,
}

interface LoginInfo {
  email: string;
  password: string;
}

interface ErrorRes {
  response: {
    data: {
      ok: 0;
      message: string;
    }
  }
}

const Login = function(){
  const code = useRecoilValue(codeState)!;
  const setUser = useSetRecoilState(userState);
  const [values, setValues] = useState({
    email: 's1@market.com',
    password: '11111111'
  });

  const axios = useCustomAxios();

  const loginUser = useMutation<LoginRes, ErrorRes, LoginInfo>({
    mutationFn: (loginInfo: LoginInfo) => {
      return axios.post('/users/login', loginInfo);
    },
    retry: false,
    onSuccess: (data: LoginRes) => {
      console.log(data);
      if(data?.data?.item){
        const userInfo = data.data.item;
        localStorage.accessToken = userInfo.token.accessToken;
        localStorage.refreshToken = userInfo.token.refreshToken;
        
        setUser({
          _id: userInfo._id,
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          address: userInfo.address,
          type: userInfo.type,
          membershipClass: code.flatten[userInfo.extra.membershipClass].value,
        });
        alert('로그인 되었습니다.');
        // navigate(`/orders/${data.item._id}`);
      }
    },
    onError: (err: ErrorRes) => {
      alert(err.response?.data?.message);
    }
  });


  const handleChange = function(e: ChangeEvent<HTMLInputElement>){
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async function(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    loginUser.mutate(values);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="email" id="email" name="email" value={values.email} onChange={handleChange} /><br />
        <input type="password" id="password" name="password" value={values.password} onChange={handleChange} /><br />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;