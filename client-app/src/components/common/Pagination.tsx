import { Link, useLocation } from "react-router-dom";
import queryString from 'query-string';
import { useEffect } from "react";


const Pagination = function({totalPage, current=1}: { totalPage: number, current?: number }){
  const location = useLocation();
  const pageList = [];

  const parsedQS = queryString.parse(location.search);

  useEffect(()=>{
    console.log('Pagination 마운트.');
  });

  for(let page=1; page<=totalPage; page++){
    parsedQS.page = page.toString();
    const search = queryString.stringify(parsedQS);
    pageList.push(<li key={page} className={current==page?'active':''} ><Link to={`/products?${search}`}>{page}</Link></li>);
  }
  return (
    <div>
      <ul>
        {pageList}
      </ul>
    </div>
  );
};

export default Pagination;