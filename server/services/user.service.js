import bcrypt from 'bcrypt';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import authService from '#services/auth.service.js';

const userService = {
  // 회원 가입
  async signup(userModel, userInfo){
    logger.trace(userInfo);

    let user = await userModel.findBy({ email: userInfo.email });
    if(user){
      throw createError(409, '이미 등록된 이메일입니다.');
    }else{
      const salt = await bcrypt.genSalt();
      userInfo.password = await bcrypt.hash(userInfo.password, salt);
      userInfo.loginType = 'email';

      const newUser = await userModel.create(userInfo);
      return newUser;
    }
  },

  // 카카오 회원 가입
  async signupKakao(userModel, userInfo){
    logger.trace(userInfo);
    userInfo.loginType = 'kakao';
    const newUser = await userModel.create(userInfo);
    return newUser;
  },

  // OAuth 회원 가입
  async signupOAuth(userModel, userInfo){
    logger.trace(userInfo);

    let user = await userModel.findBy({ 'extra.providerAccountId': userInfo.extra.providerAccountId });
    if(user){
      throw createError(409, `이미 가입된 회원입니다.(${userInfo.loginType})`);
    }else{
      const user = await userModel.create(userInfo);
      return user;
      // 자동으로 로그인 처리
      // const loginUser = await this.loginOAuth(userModel, userInfo.extra.providerAccountId);
      // return loginUser;
    }
  },

  // 로그인
  async login(userModel, { email, password }){
    const user = await userModel.findBy({ email });
    logger.log(user);
    if(user){
      const isSame = await bcrypt.compare(password, user.password);
      if(isSame){
        delete user.password;
        return await this.setToken(userModel, user);
      }
    }
    // 401은 토큰 인증 오류에 사용하므로 로그인 실패는 403(권한없음)으로 사용
    throw createError(403, '아이디와 패스워드를 확인하시기 바랍니다.');
  },

  // 카카오 로그인
  async loginKakao(userModel, kakaoId){
    const user = await userModel.findBy({ 'kakao.id': kakaoId});
    logger.log(user);
    if(user){
      return await this.setToken(userModel, user);
    }else{
      return false;
    }
  },

  // OAuth 로그인
  async loginOAuth(userModel, providerAccountId){
    const user = await userModel.findBy({ 'extra.providerAccountId': providerAccountId});
    logger.log(user);
    if(user){
      return await this.setToken(userModel, user);
    }else{
      return false;
    }
  },

  // 로그인 성공한 회원 정보에 토큰 부여
  async setToken(userModel, user){
    const token = await authService.sign({ _id: user._id, type: user.type, name: user.name, email: user.email, image: user.image, loginType: user.loginType });
    logger.log('token', token);
    await userModel.updateRefreshToken(user._id, token.refreshToken);
    user.token = token;
    delete user.refreshToken;
    return user;
  },

  // 회원정보 수정
  async update(userModel, id, updateInfo){
    let password = updateInfo.password;
    if(updateInfo.password){
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(updateInfo.password, salt);
      updateInfo.password = hashedPassword;
    }
    const updated = await userModel.update(id, updateInfo);
    if(updated && password){
      // 암호화 이전의 비밀번호
      updated.password = password;
    }
    return updated;
  }
};

export default userService;
