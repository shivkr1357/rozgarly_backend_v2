import { Server, Namespace } from 'socket.io';
import { CommunityService } from '../services/CommunityService.js';

export const setupCommunityNamespace = (io: Server): void => {
  const communityNamespace: Namespace = io.of('/community');
  const communityService = new CommunityService();

  // Authentication middleware for community namespace
  communityNamespace.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // User should already be authenticated by the main middleware
      if (!socket.data.user) {
        return next(new Error('User not authenticated'));
      }

      next();
    } catch (error) {
      console.error('Community namespace authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
      });
      next(new Error('Authentication failed'));
    }
  });

  communityNamespace.on('connection', socket => {
    const userId = socket.data.user.uid;

    console.log('User connected to community namespace', {
      userId,
      socketId: socket.id,
    });

    // Join group room
    socket.on('join-group', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;

        // Verify user is a member of the group
        const group = await communityService.getGroupById(groupId);
        if (!group) {
          socket.emit('error', { message: 'Group not found' });
          return;
        }

        if (!group.members.includes(userId)) {
          socket.emit('error', { message: 'You are not a member of this group' });
          return;
        }

        // Join the room
        socket.join(`group-${groupId}`);

        // Notify others in the group
        socket.to(`group-${groupId}`).emit('user-joined', {
          userId,
          userName: socket.data.user.name,
          timestamp: new Date().toISOString(),
        });

        // Send recent messages to the user
        const messages = await communityService.getMessages({
          groupId,
          page: 1,
          limit: 50,
        });

        socket.emit('recent-messages', {
          groupId,
          messages: messages.data,
        });

        console.log('User joined group room', {
          userId,
          groupId,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error joining group room', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    // Leave group room
    socket.on('leave-group', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;

        // Leave the room
        socket.leave(`group-${groupId}`);

        // Notify others in the group
        socket.to(`group-${groupId}`).emit('user-left', {
          userId,
          userName: socket.data.user.name,
          timestamp: new Date().toISOString(),
        });

        console.log('User left group room', {
          userId,
          groupId,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error leaving group room', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
      }
    });

    // Send message
    socket.on(
      'send-message',
      async (data: {
        groupId: string;
        content: string;
        type?: 'text' | 'image' | 'file';
        metadata?: Record<string, any>;
      }) => {
        try {
          const { groupId, content, type = 'text', metadata } = data;

          // Verify user is a member of the group
          const group = await communityService.getGroupById(groupId);
          if (!group) {
            socket.emit('error', { message: 'Group not found' });
            return;
          }

          if (!group.members.includes(userId)) {
            socket.emit('error', { message: 'You are not a member of this group' });
            return;
          }

          // Create message
          const message = await communityService.createMessage(userId, {
            groupId,
            content,
            type,
            metadata,
          });

          // Broadcast message to all users in the group
          communityNamespace.to(`group-${groupId}`).emit('new-message', {
            message: {
              id: message.id,
              groupId: message.groupId,
              senderUid: message.senderUid,
              senderName: socket.data.user.name,
              senderPicture: socket.data.user.picture,
              content: message.content,
              type: message.type,
              metadata: message.metadata,
              reactions: message.reactions,
              isEdited: message.isEdited,
              createdAt: message.createdAt,
              updatedAt: message.updatedAt,
            },
          });

          console.log('Message sent', {
            userId,
            groupId,
            messageId: message.id,
            socketId: socket.id,
          });
        } catch (error) {
          console.error('Error sending message', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            socketId: socket.id,
          });
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    // Edit message
    socket.on('edit-message', async (data: { messageId: string; content: string }) => {
      try {
        const { messageId, content } = data;

        const message = await communityService.updateMessage(messageId, { content }, userId);

        if (message) {
          // Broadcast updated message to all users in the group
          communityNamespace.to(`group-${message.groupId}`).emit('message-edited', {
            messageId: message.id,
            content: message.content,
            editedAt: message.editedAt,
            updatedAt: message.updatedAt,
          });
        }

        console.log('Message edited', {
          userId,
          messageId,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error editing message', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Delete message
    socket.on('delete-message', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        // Get message first to get groupId
        // const message = await communityService.getMessages({ groupId: '', page: 1, limit: 1 });
        // This is a simplified approach - in production you'd want to get the specific message

        await communityService.deleteMessage(messageId, userId);

        // Broadcast message deletion to all users in the group
        communityNamespace.emit('message-deleted', {
          messageId,
        });

        console.log('Message deleted', {
          userId,
          messageId,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error deleting message', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Add reaction
    socket.on('add-reaction', async (data: { messageId: string; emoji: string }) => {
      try {
        const { messageId, emoji } = data;

        const message = await communityService.addReaction(messageId, emoji, userId);

        if (message) {
          // Broadcast reaction to all users in the group
          communityNamespace.to(`group-${message.groupId}`).emit('reaction-added', {
            messageId: message.id,
            emoji,
            userId,
            userName: socket.data.user.name,
            reactions: message.reactions,
          });
        }

        console.log('Reaction added', {
          userId,
          messageId,
          emoji,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error adding reaction', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Remove reaction
    socket.on('remove-reaction', async (data: { messageId: string; emoji: string }) => {
      try {
        const { messageId, emoji } = data;

        const message = await communityService.removeReaction(messageId, emoji, userId);

        if (message) {
          // Broadcast reaction removal to all users in the group
          communityNamespace.to(`group-${message.groupId}`).emit('reaction-removed', {
            messageId: message.id,
            emoji,
            userId,
            userName: socket.data.user.name,
            reactions: message.reactions,
          });
        }

        console.log('Reaction removed', {
          userId,
          messageId,
          emoji,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error removing reaction', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
        });
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data: { groupId: string }) => {
      const { groupId } = data;
      socket.to(`group-${groupId}`).emit('user-typing', {
        userId,
        userName: socket.data.user.name,
        isTyping: true,
      });
    });

    socket.on('typing-stop', (data: { groupId: string }) => {
      const { groupId } = data;
      socket.to(`group-${groupId}`).emit('user-typing', {
        userId,
        userName: socket.data.user.name,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', reason => {
      console.log('User disconnected from community namespace', {
        userId,
        socketId: socket.id,
        reason,
      });
    });
  });
};
