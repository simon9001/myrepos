import type { FastifyPluginAsync } from 'fastify';
import { adminDb } from '../lib/supabase';
import { mapDbError } from '../lib/errors';

export const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  // List current user's notifications
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { unread_only, limit = '50', offset = '0' } =
      request.query as { unread_only?: string; limit?: string; offset?: string };

    let query = adminDb
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', request.authUser.id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (unread_only === 'true') query = query.eq('is_read', false);

    const { data, error, count } = await query;
    if (error) throw mapDbError(error);

    return reply.send({ data, total: count, unread: count });
  });

  // Mark single notification as read
  fastify.patch('/:id/read', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const { error } = await adminDb
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', request.authUser.id);

    if (error) throw mapDbError(error);
    return reply.send({ message: 'Marked as read.' });
  });

  // Mark all notifications as read
  fastify.patch('/read-all', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { error } = await adminDb
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', request.authUser.id)
      .eq('is_read', false);

    if (error) throw mapDbError(error);
    return reply.send({ message: 'All notifications marked as read.' });
  });

  // Delete a notification
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const { error } = await adminDb
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', request.authUser.id);

    if (error) throw mapDbError(error);
    return reply.status(204).send();
  });

  // Unread count (lightweight — for badge in UI)
  fastify.get('/unread-count', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { count, error } = await adminDb
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', request.authUser.id)
      .eq('is_read', false);

    if (error) throw mapDbError(error);
    return reply.send({ count: count ?? 0 });
  });
};
