import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ProductItemType } from "../../components/product/ProductListTypeEntry";

import QuantityInput from "../../components/common/QuantityInput";
import { AxiosResponse, AxiosError } from 'axios';
import useCustomAxios from '../../hooks/useCustomAxios';
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ProductResType } from "../product/ProductDetail";
import queryString from "query-string";
import { userState } from "../../recoil/user/atoms";
import { useRecoilValue } from "recoil";


interface OrderRes {
  ok: 0 | 1;
  item?: ProductItemType;
  message?: string;
}

interface OrderProduct {
  _id: number;
  quantity: number;
  state: string;
}

interface OrderInfo {
  products: OrderProduct[],
  address: {
    name: string;
    value: string;
  },
  payment: object
}

interface IamportRes {
  success: boolean;
  error_msg: string;
  [attr: string]: string | boolean;
}

const OrderNew = function(){
  const user = useRecoilValue(userState);
  const location = useLocation();
  const product_id = queryString.parse(location.search).product_id;
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const handleSetQuantity = (quantity: number) => {
    setQuantity(quantity);
  };

  const axios = useCustomAxios();

  const { data, error } = useQuery({
    queryKey: ['orders/new', product_id], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductResType>(`/products/${product_id}`),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    // retry: false
  });

  useEffect(() => {
    console.log('OrderNew 마운트')
    return () => console.log('OrderNew 언마운트');
  }, []);

  console.log(data, error);

  function requestPay(): Promise<IamportRes> {
    return new Promise((resolve, reject) => {
      const { IMP } = window;
      IMP.init('imp14397622');
  
      const payInfo = {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid: `mid_${new Date().getTime()}`,  // 주문 id
        name: data!.name,
        amount: data!.price * quantity,
        buyer_name: user!.name,
        buyer_tel: user!.phone,
        buyer_email: user!.email,
        buyer_address: user!.address
      };
  
      console.log(payInfo);
  
      IMP.request_pay(payInfo, (res: IamportRes) => {
        console.log(res);
        if(res.success){
          resolve(res);
        }else{
          const error = new Error(`결제 실패\n${res.error_msg}`);
          error.name = 'checkout';
          reject(error);
        }
      });
    });
  }

  const createOrder = useMutation<AxiosResponse<OrderRes>, AxiosError<OrderRes>, OrderInfo>({
    mutationFn: (order: OrderInfo) => {
      return axios.post('/orders', order);
    },
    retry: false,
    // retry: 3,
    // retryDelay: 1000,
    onSuccess: (res) => {
      console.log(res);
      if(res?.data.item){
        alert('주문 완료.');
        navigate(`/orders`);
        // navigate(`/orders/${data.item._id}`);
      }
    },
    onError: (err) => {
      alert(err.response?.data?.message || '주문 실패');
    }
  });

  const handleOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try{
      // 결제
      const res = await requestPay();

      createOrder.mutate({
        products: [
          {
            _id: data!._id,
            quantity,
            // state: 'OS010', // 결제 없이 주문만 할 경우
            state: 'OS020', // 결제 완료 상태
          }
        ],
        address: {
          name: '기본',
          value: user!.address
        },
        payment: res
      });
   
    }catch(err){
      console.log(err);
      if(err instanceof Error && err.name === 'checkout'){
        alert(err.message);
      }
    }
  };
  
  return (
    <div>
      <h3>상품 구매</h3>
      
      { error && error.message }
      { data && 
      <div className="pcontent">
        <img src={`${import.meta.env.VITE_API_SERVER}${data.mainImages[0]?.url}`} width="100px" />
        <p>상품명: {data.name}</p>
        <p>가격: <output>{data.price*quantity}</output></p>
        <form>
          <QuantityInput max={data.quantity-data.buyQuantity} setter={handleSetQuantity} /> 가능 수량: {data.quantity-data.buyQuantity}
          
        </form>
        <button onClick={ handleOrder }>결제 하기</button>
      </div>
      }
        

    </div>
  );
};

export default OrderNew;