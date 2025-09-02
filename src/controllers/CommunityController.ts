import type { Request, Response } from 'express';
import { CommunityService } from '../services/CommunityService.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

  createGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const group = await this.communityService.createGroup(req.user!.uid, req.body);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group,
    });
  });

  getGroupById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const group = await this.communityService.getGroupById(id!);

    res.json({
      success: true,
      message: 'Group retrieved successfully',
      data: group,
    });
  });

  updateGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const group = await this.communityService.updateGroup(id!, req.body, req.user!.uid);

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group,
    });
  });

  deleteGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await this.communityService.deleteGroup(id!, req.user!.uid);

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  });

  getGroups = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.communityService.getGroups(req.query as any);

    res.json({
      success: true,
      message: 'Groups retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  joinGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { groupId } = req.body;
    const group = await this.communityService.joinGroup(groupId, req.user!.uid);

    res.json({
      success: true,
      message: 'Joined group successfully',
      data: group,
    });
  });

  leaveGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { groupId } = req.body;
    const group = await this.communityService.leaveGroup(groupId, req.user!.uid);

    res.json({
      success: true,
      message: 'Left group successfully',
      data: group,
    });
  });

  getUserGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const groups = await this.communityService.getUserGroups(req.user!.uid);

    res.json({
      success: true,
      message: 'User groups retrieved successfully',
      data: groups,
    });
  });

  createMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const message = await this.communityService.createMessage(req.user!.uid, req.body);

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: message,
    });
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.communityService.getMessages(req.query as any);

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  updateMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const message = await this.communityService.updateMessage(id!, req.body, req.user!.uid);

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message,
    });
  });

  deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await this.communityService.deleteMessage(id!, req.user!.uid);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  });

  addReaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { messageId, emoji } = req.body;
    const message = await this.communityService.addReaction(messageId, emoji, req.user!.uid);

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: message,
    });
  });

  removeReaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { messageId, emoji } = req.body;
    const message = await this.communityService.removeReaction(messageId, emoji, req.user!.uid);

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: message,
    });
  });
}
