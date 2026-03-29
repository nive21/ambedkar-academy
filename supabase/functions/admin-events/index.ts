import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function getEnv(key: string) {
  const denoGlobal = globalThis as typeof globalThis & {
    Deno?: { env: { get: (envKey: string) => string | undefined } };
  };
  return denoGlobal.Deno?.env.get(key);
}

function getAdminClient() {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

function validateAdminAccess(accessKey: string | undefined) {
  const expectedAccessKey = getEnv('ADMIN_EVENTS_ACCESS_KEY');
  if (!expectedAccessKey) {
    throw new Error('Missing ADMIN_EVENTS_ACCESS_KEY.');
  }
  if (!accessKey || accessKey !== expectedAccessKey) {
    throw new Error('Invalid admin access key.');
  }
}

function validateEventPayload(event: Record<string, string>) {
  if (!event?.eventDate || !event?.startTime || !event?.endTime || !event?.eventType || !event?.description) {
    throw new Error('Missing required event fields.');
  }

  if (event.endTime <= event.startTime) {
    throw new Error('End time must be after start time.');
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    validateAdminAccess(body?.accessKey);
    const adminClient = getAdminClient();

    if (body?.action === 'list') {
      const { data, error } = await adminClient
        .from('admin_events')
        .select('id, event_date, start_time, end_time, event_type, description, created_at')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ events: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'create') {
      validateEventPayload(body?.event);
      const { error } = await adminClient.from('admin_events').insert({
        event_date: body.event.eventDate,
        start_time: body.event.startTime,
        end_time: body.event.endTime,
        event_type: body.event.eventType,
        description: body.event.description
      });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'update') {
      if (!body?.id) throw new Error('Missing event id.');
      validateEventPayload(body?.event);
      const { error } = await adminClient
        .from('admin_events')
        .update({
          event_date: body.event.eventDate,
          start_time: body.event.startTime,
          end_time: body.event.endTime,
          event_type: body.event.eventType,
          description: body.event.description
        })
        .eq('id', body.id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'delete') {
      if (!body?.id) throw new Error('Missing event id.');
      const { error } = await adminClient.from('admin_events').delete().eq('id', body.id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
