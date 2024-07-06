import { Outlet, useLocation } from "react-router-dom";
import queryString from 'query-string';
import { codeState } from "../../recoil/code/atoms";
import { useRecoilValue } from "recoil";
import _ from 'lodash';

const Product = function(){
  const codeList = useRecoilValue(codeState)!.flatten;
  const location = useLocation();
  const menu = queryString.parse(location.search).menu;
  const category = queryString.parse(location.search).category || queryString.parse(location.search).subCategory;

  let title = '상품';
  switch(menu){
    case 'new':
      title = '신상품';
      break;
    case 'kidult':
      title = '키덜트 존';
      break;
    case 'best':
      title = '베스트';
      break;
  }

  if(typeof category === 'string'){
    const result = _.find(codeList, {code: category});
    console.log(result);
    if(result){
      title = result.value;
    }
  }

  return (
    <main>
      <h1>{title}</h1>
      <Outlet />
    </main>
  );
};

export default Product;