import { useLocation } from "react-router";
import ProductEntry, { ProductItemType } from "../../components/product/ProductListTypeEntry";
import queryString from "query-string";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useCustomAxios from '../../hooks/useCustomAxios';
import Category from "../../components/product/Category";
import _ from 'lodash';
import { CategoryCodeItemType, codeState } from "../../recoil/code/atoms";
import { useRecoilValue } from "recoil";
import Pagination from '../../components/common/Pagination';

interface ProductResType {
  ok: 0 | 1;
  item?: [
    ProductItemType
  ];
  message?: string;
}

interface FilterType {
  [key: string]: string | boolean | number;
}

const ProductList = function(){
  console.log(useRecoilValue(codeState)!.nested);
  // const categoryList = useRecoilValue(codeState)!.nested.productCategory;
  const codeList = useRecoilValue(codeState)!.flatten;
  const location = useLocation();
  const search = queryString.parse(location.search);
  const menu = search.menu;
  const category = search.category;

  let filter: FilterType = {};
  switch(menu){
    case 'new':
      filter = {"extra.isNew": true};
      break;
    case 'kidult':
      filter = {"extra.category.0": "PC03"};
      break;
    case 'best':
      filter = {"extra.isBest": true};
      break;
  }

  if(typeof category === 'string'){
    const result = codeList[category] as CategoryCodeItemType;
    if(result?.depth){
      filter = {[`extra.category.${result.depth-1}`]: category};
    }
  }

  // filter.page = page || 1;

  console.log(filter);

  const axios = useCustomAxios();

  const totalPage = 3;

  useEffect(() => {
    console.log('ProductList 마운트');
    return ()=>console.log('ProductList 언마운트');
  });

  const {isLoading, data, error} = useQuery({
    queryKey: ['products', filter], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductResType>(`/products`, {params: {custom: JSON.stringify(filter)}}),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    retry: false
  });
  console.log({isLoading, data, error});

  const itemList = data?.map(product => {
    return <ProductEntry key={product._id} product={product} />;
  });
  
  return (
    <div>
      <div>
        <Category />
      </div>
      <h3>상품 목록</h3>
      <div>
        { error && error.message }
        { isLoading && '로딩중...' }
        <ul>
          { itemList }
        </ul>
      </div>
      <Pagination totalPage={ totalPage } />
    </div>
     
  );
};

export default ProductList;