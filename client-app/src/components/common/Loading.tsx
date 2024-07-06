import {Background, LoadingText} from './Loading.styled';
import Spinner from '../../assets/images/spinner.gif';
const Loading = function(){
  return (
    <Background>
      <LoadingText>잠시만 기다려 주세요.</LoadingText>
      <img src={Spinner} alt="로딩중" width="5%" />
    </Background>
  );
};

export default Loading;
