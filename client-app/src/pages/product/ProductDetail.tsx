import { useEffect } from "react";
import { useParams } from "react-router";
import type { ProductItemType } from "../../components/product/ProductListTypeEntry";
import { Link } from "react-router-dom";
import useCustomAxios from '../../hooks/useCustomAxios';
import { useQuery } from "@tanstack/react-query";

export interface ProductResType {
  ok: 0 | 1,
  item: ProductItemType
}

const ProductNew = function(){

  const { _id } = useParams();

  const axios = useCustomAxios();

  useEffect(() => {
    console.log('ProductDetail 마운트');
    return ()=>console.log('ProductDetail 언마운트');
  });

  const {isLoading, data, error} = useQuery({
    queryKey: ['products', _id], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductResType>(`/products/${_id}`),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    retry: false
  });
  console.log({isLoading, data, error});

  return (
    <div>
      <h3>상품 정보</h3>      
      { error && error.message }
      { data && 
        <div className="pcontent">
          <Link to="/carts/new" state={data}>장바구니에 담기</Link><br />
          {(data.quantity > data.buyQuantity) ? 
            <Link to={`/orders/new?product_id=${data._id}`} state={data}>바로 구매</Link>
          :
            <span>매진</span>
          }
          <br /><br />
          <img src={`${import.meta.env.VITE_API_SERVER}${data.mainImages[0]?.url}`} width="300px" />
          <Link to={`${import.meta.env.VITE_API_SERVER}/files/download/${data.mainImages[0]?.fileName}?name=${data.mainImages[0]?.orgName}`}>이미지 다운로드</Link>
          <p>가격: {data.price}</p>
          <p>배송비: {data.shippingFees}</p>
          <div dangerouslySetInnerHTML={{ __html: data.content }}/>
        </div>
      }
      

    </div>
  );
};

export default ProductNew;