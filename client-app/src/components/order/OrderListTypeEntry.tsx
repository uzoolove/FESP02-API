import { Link } from "react-router-dom";
import type { ReplyItemType } from "../reply/ReplyListTypeEntry";
import { useRecoilValue } from "recoil";
import { codeState } from "../../recoil/code/atoms";

interface OrderProductType {
  _id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  reply_id?: number;
  reply?: ReplyItemType;
}

export interface OrderItemType {
  _id: number;
  user_id: number;
  state: string;
  products: [ OrderProductType ];
  cost: {
    products: number;
    shippingFees: number;
    discount: {
      products: number;
      shippingFees: number;
    }
    total: number;
  };
  delivery: {
    company: string;
    trackingNumber: string;
    url: string;
  },
  payment: {
    receipt_url: string
  };
  address: object;
  createdAt: string;
  updatedAt: string;
}

type Props = {
  order: OrderItemType
};

const OrderEntry = function({ order }: Props){
  const code = useRecoilValue(codeState);
  const products = order.products.map(product => {
    return (
      <li key={product._id}>
        <Link to={`/products/${product._id}`}>{product.name}</Link> x {product.quantity}개, 금액: {product.price}
      </li>
    );
  });
  return (
    <li>
      <p>구매 날짜: { order.createdAt }</p>
      <p>주문 상태: { code?.flatten[order.state]?.value }</p>

      { order.payment &&
        <Link to={order.payment.receipt_url} target="_blank">결제 내역 조회</Link>
      }
      
      { order.delivery && 
        <ul>
          <li>택배사: {order.delivery.company}</li>
          <li>송장번호: {order.delivery.trackingNumber}</li>
          <li>실시간 배송 확인: <Link to={order.delivery.url} target="_blank">{order.delivery.url}</Link></li>
        </ul>
      }     
      
      <p>주문 내역</p>
      <ul>
        { products }
      </ul>
      <p>상품 가격 합계: { order.cost.products }</p>
      <p>배송비 합계: { order.cost.shippingFees }</p>
      <p>상품 할인: { order.cost.discount.products }</p>
      <p>배송비 할인: { order.cost.discount.shippingFees }</p>
      <p>최종 결제 금액: { (order.cost.discount.products || order.cost.discount.shippingFees) ? 
        <del>{ order.cost.products + order.cost.shippingFees }</del> : '' }
        <span> { order.cost.total }</span>
      </p>
    </li>
  );
};

export default OrderEntry;