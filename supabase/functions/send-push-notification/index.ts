import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  ubs_id: string;
  ubs_nome?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.error('FCM_SERVER_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'FCM not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ubs_id, ubs_nome }: PushRequest = await req.json();
    console.log('Sending push for UBS:', ubs_id, ubs_nome);

    if (!ubs_id) {
      return new Response(
        JSON.stringify({ error: 'ubs_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Busca nome da UBS se não foi fornecido
    let ubsNome = ubs_nome;
    if (!ubsNome) {
      const { data: ubsData } = await supabase
        .from('postos')
        .select('nome')
        .eq('id', ubs_id)
        .single();
      
      ubsNome = ubsData?.nome || 'UBS';
    }

    // Busca assinaturas ativas para essa UBS
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('token')
      .eq('ubs_id', ubs_id)
      .eq('enabled', true);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for UBS:', ubs_id);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active subscribers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Busca tokens com opt_in ativo
    const tokenStrings = subscriptions.map((s: { token: string }) => s.token);
    const { data: activeTokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .in('token', tokenStrings)
      .eq('opt_in', true);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Active tokens to notify:', activeTokens?.length || 0);

    if (!activeTokens || activeTokens.length === 0) {
      console.log('No active tokens with opt_in for UBS:', ubs_id);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active subscribers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Monta mensagem
    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const message = {
      notification: {
        title: 'Lista de Medicamentos Atualizada',
        body: `${ubsNome} atualizou a lista de medicamentos hoje às ${hora}`,
        icon: '/logo-192.png'
      },
      data: {
        ubs_id: ubs_id,
        type: 'pdf_update',
        timestamp: now.toISOString()
      }
    };

    // Envia para cada token via FCM
    const tokens = activeTokens.map((t: { token: string }) => t.token);
    let successCount = 0;
    let failureCount = 0;

    for (const token of tokens) {
      try {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: token,
            ...message
          })
        });

        const result = await fcmResponse.json();
        console.log('FCM response for token:', token.substring(0, 20) + '...', result);

        if (result.success === 1) {
          successCount++;
        } else {
          failureCount++;
          
          // Remove tokens inválidos
          if (result.results?.[0]?.error === 'NotRegistered' || 
              result.results?.[0]?.error === 'InvalidRegistration') {
            console.log('Removing invalid token:', token.substring(0, 20) + '...');
            await supabase.from('push_tokens').delete().eq('token', token);
            await supabase.from('push_subscriptions').delete().eq('token', token);
          }
        }
      } catch (error) {
        console.error('Error sending to token:', error);
        failureCount++;
      }
    }

    console.log('Push notifications sent:', { success: successCount, failure: failureCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failureCount,
        total: tokens.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
