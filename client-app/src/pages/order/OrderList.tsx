import OrderEntry, { OrderItemType } from "../../components/order/OrderListTypeEntry";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useCustomAxios from '../../hooks/useCustomAxios';

interface OrderRes {
  ok: 0 | 1;
  item?: [
    OrderItemType
  ];
  message?: string;
}

const OrderList = function(){

  const axios = useCustomAxios();

  useEffect(() => {
    console.log('OrderList 마운트');
    return ()=>console.log('OrderList 언마운트');
  });

  const {isLoading, data, error} = useQuery({
    queryKey: ['orders'],
    queryFn: () => axios.get<OrderRes>(`/orders`),
    select: res => res.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    retry: false
  });
  console.log({isLoading, data, error});

  const itemList = data?.map(order => {
    return <OrderEntry key={order._id} order={order} />;
  });
  
  return (
    <div>
      { error && error.message }
      <ul>
        { itemList }
      </ul>
    </div>
  );
};

export default OrderList;