import { rpcCall } from './client';
import {
  RegisterReq,
  RegisterRsp,
  LoginReq,
  LoginRsp,
  LogoutReq,
  LogoutRsp,
  SendVerifyCodeReq,
  SendVerifyCodeRsp,
  RefreshTokenReq,
  RefreshTokenRsp,
  GetProfileReq,
  GetProfileRsp,
  UpdateProfileReq,
  UpdateProfileRsp,
  SearchUsersReq,
  SearchUsersRsp,
  GetMultiUserInfoReq,
  GetMultiUserInfoRsp,
} from '@/proto/identity/identity_service';

/**
 * Identity REST service wrapping all Identity RPC endpoints.
 * Each method serializes the request with protobuf and deserializes the response.
 *
 * protobuf-ts uses declaration merging: each exported name is both an
 * interface (for typing) and a const MessageType (for toBinary/fromBinary).
 * In type positions they resolve to the interface; in value positions to the const.
 */
export const IdentityService = {
  register: (req: RegisterReq) =>
    rpcCall<RegisterRsp>({
      path: '/service/identity/register',
      auth: 'WHITELISTED',
      requestBody: RegisterReq.toBinary(req),
      responseType: RegisterRsp,
    }),

  login: (req: LoginReq) =>
    rpcCall<LoginRsp>({
      path: '/service/identity/login',
      auth: 'WHITELISTED',
      requestBody: LoginReq.toBinary(req),
      responseType: LoginRsp,
    }),

  logout: (req: LogoutReq) =>
    rpcCall<LogoutRsp>({
      path: '/service/identity/logout',
      auth: 'JWT_REQUIRED',
      requestBody: LogoutReq.toBinary(req),
      responseType: LogoutRsp,
    }),

  sendVerifyCode: (req: SendVerifyCodeReq) =>
    rpcCall<SendVerifyCodeRsp>({
      path: '/service/identity/send_verify_code',
      auth: 'WHITELISTED',
      requestBody: SendVerifyCodeReq.toBinary(req),
      responseType: SendVerifyCodeRsp,
    }),

  refreshToken: (req: RefreshTokenReq) =>
    rpcCall<RefreshTokenRsp>({
      path: '/service/identity/refresh_token',
      auth: 'WHITELISTED',
      requestBody: RefreshTokenReq.toBinary(req),
      responseType: RefreshTokenRsp,
    }),

  getProfile: (req: GetProfileReq) =>
    rpcCall<GetProfileRsp>({
      path: '/service/identity/get_profile',
      auth: 'JWT_REQUIRED',
      requestBody: GetProfileReq.toBinary(req),
      responseType: GetProfileRsp,
    }),

  updateProfile: (req: UpdateProfileReq) =>
    rpcCall<UpdateProfileRsp>({
      path: '/service/identity/update_profile',
      auth: 'JWT_REQUIRED',
      requestBody: UpdateProfileReq.toBinary(req),
      responseType: UpdateProfileRsp,
    }),

  searchUsers: (req: SearchUsersReq) =>
    rpcCall<SearchUsersRsp>({
      path: '/service/identity/search_users',
      auth: 'JWT_REQUIRED',
      requestBody: SearchUsersReq.toBinary(req),
      responseType: SearchUsersRsp,
    }),

  getMultiUserInfo: (req: GetMultiUserInfoReq) =>
    rpcCall<GetMultiUserInfoRsp>({
      path: '/service/identity/get_multi_info',
      auth: 'JWT_REQUIRED',
      requestBody: GetMultiUserInfoReq.toBinary(req),
      responseType: GetMultiUserInfoRsp,
    }),
};
