import { Request } from 'express';

export interface RequestWithAuth extends Request {
  auth?: any;
}

export enum AdminType {
  regular_user = 'regular_user',
  admin = 'admin',
  super_admin = 'super_admin'
}

export interface User {
  username: string;
  email: string;
  create_time?: Date;
  admin_type?: AdminType;
  is_disabled?: boolean;
  auth0_id?: string;
  UserProfile?: UserProfile;
}

export interface UserProfile {
  id: string;
  real_name?: string;
  avatar?: string;
  blog?: string;
  github?: string;
  school?: string;
  major?: string;
  language?: string;
  accepted_number?: number;
  total_score?: number;
  total_practice_score?: number;
  submission_number?: number;
  rating?: number;
  user: User;
  username: string;
}
