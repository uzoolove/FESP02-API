import './App.css';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from "react-router-dom";
import Router from "./Router";
import { codeState } from './recoil/code/atoms';
import { Suspense, useEffect } from 'react';
import Loading from './components/common/Loading';
import { useSetRecoilState } from 'recoil';

const queryClient = new QueryClient();

function App() {
  const setCode = useSetRecoilState(codeState);
  useEffect(() => {
    (async()=>{
      const codes = await axios.get('/codes');
      setCode(codes.data?.item);
    })();
    console.log('App 마운트');
  });
 
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={Router} />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
