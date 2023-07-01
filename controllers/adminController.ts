import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getAllUsers } from '../services/adminService';

export const getAllUsersController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const users = await getAllUsers();
  return res.status(StatusCodes.OK).json({ success: true, users });
};
