import { Router } from 'express';
import { CommunityController } from '../controllers/CommunityController.js';
import { verifyFirebaseToken } from '../middlewares/auth.js';
import { validateDto, validateQuery, validateParams } from '../middlewares/validateDto.js';
import { 
  CreateGroupDto, 
  UpdateGroupDto, 
  CreateMessageDto, 
  UpdateMessageDto, 
  GetGroupsDto, 
  GetMessagesDto,
  JoinGroupDto,
  LeaveGroupDto,
  AddReactionDto,
  RemoveReactionDto,
  IdParamDto 
} from '../dtos/community.dto.js';

const router = Router();
const communityController = new CommunityController();

// All routes require authentication
router.use(verifyFirebaseToken);

// Group routes
router.post('/groups', validateDto(CreateGroupDto), communityController.createGroup);
router.get('/groups', validateQuery(GetGroupsDto), communityController.getGroups);
router.get('/groups/my-groups', communityController.getUserGroups);
router.get('/groups/:id', validateParams(IdParamDto), communityController.getGroupById);
router.put('/groups/:id', validateParams(IdParamDto), validateDto(UpdateGroupDto), communityController.updateGroup);
router.delete('/groups/:id', validateParams(IdParamDto), communityController.deleteGroup);

// Group membership routes
router.post('/groups/join', validateDto(JoinGroupDto), communityController.joinGroup);
router.post('/groups/leave', validateDto(LeaveGroupDto), communityController.leaveGroup);

// Message routes
router.post('/messages', validateDto(CreateMessageDto), communityController.createMessage);
router.get('/messages', validateQuery(GetMessagesDto), communityController.getMessages);
router.put('/messages/:id', validateParams(IdParamDto), validateDto(UpdateMessageDto), communityController.updateMessage);
router.delete('/messages/:id', validateParams(IdParamDto), communityController.deleteMessage);

// Reaction routes
router.post('/messages/reactions', validateDto(AddReactionDto), communityController.addReaction);
router.delete('/messages/reactions', validateDto(RemoveReactionDto), communityController.removeReaction);

export default router;
