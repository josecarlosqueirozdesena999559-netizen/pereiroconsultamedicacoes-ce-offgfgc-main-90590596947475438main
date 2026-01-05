import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscription {
  ubs_id: string;
  enabled: boolean;
}

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [optIn, setOptIn] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const isNativePlatform = Capacitor.isNativePlatform();

  // Carrega token e assinaturas do localStorage/banco
  const loadStoredData = useCallback(async () => {
    const storedToken = localStorage.getItem('push_token');
    if (storedToken) {
      setToken(storedToken);
      
      // Busca dados do banco
      const { data: tokenData } = await supabase
        .from('push_tokens')
        .select('opt_in')
        .eq('token', storedToken)
        .single();
      
      if (tokenData) {
        setOptIn(tokenData.opt_in);
      }

      const { data: subsData } = await supabase
        .from('push_subscriptions')
        .select('ubs_id, enabled')
        .eq('token', storedToken);
      
      if (subsData) {
        setSubscriptions(subsData);
      }
    }
    setLoading(false);
  }, []);

  // Registra o dispositivo para push
  const registerPush = useCallback(async () => {
    if (!isNativePlatform) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    try {
      // Verifica permissão
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        toast.error('Permissão de notificações negada');
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering push:', error);
      toast.error('Erro ao registrar notificações');
    }
  }, [isNativePlatform]);

  // Salva token no banco
  const saveToken = useCallback(async (pushToken: string) => {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          token: pushToken,
          platform: 'android',
          opt_in: true,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'token'
        });

      if (error) throw error;
      
      localStorage.setItem('push_token', pushToken);
      setToken(pushToken);
      setOptIn(true);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }, []);

  // Atualiza opt_in
  const updateOptIn = useCallback(async (newOptIn: boolean) => {
    if (!token) return;

    try {
      const { error } = await supabase
        .from('push_tokens')
        .update({ opt_in: newOptIn })
        .eq('token', token);

      if (error) throw error;
      
      setOptIn(newOptIn);
      toast.success(newOptIn ? 'Notificações ativadas' : 'Notificações desativadas');
    } catch (error) {
      console.error('Error updating opt_in:', error);
      toast.error('Erro ao atualizar preferências');
    }
  }, [token]);

  // Atualiza assinatura de UBS
  const updateSubscription = useCallback(async (ubsId: string, enabled: boolean) => {
    if (!token) {
      toast.error('Ative as notificações primeiro');
      return;
    }

    try {
      if (enabled) {
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            token,
            ubs_id: ubsId,
            enabled: true
          }, {
            onConflict: 'token,ubs_id'
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ enabled: false })
          .eq('token', token)
          .eq('ubs_id', ubsId);

        if (error) throw error;
      }

      setSubscriptions(prev => {
        const existing = prev.find(s => s.ubs_id === ubsId);
        if (existing) {
          return prev.map(s => s.ubs_id === ubsId ? { ...s, enabled } : s);
        }
        return [...prev, { ubs_id: ubsId, enabled }];
      });

      toast.success(enabled ? 'Seguindo UBS' : 'Deixou de seguir UBS');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar assinatura');
    }
  }, [token]);

  // Verifica se está seguindo uma UBS
  const isFollowing = useCallback((ubsId: string) => {
    const sub = subscriptions.find(s => s.ubs_id === ubsId);
    return sub?.enabled ?? false;
  }, [subscriptions]);

  // Setup listeners
  useEffect(() => {
    if (!isNativePlatform) {
      setLoading(false);
      return;
    }

    loadStoredData();

    // Listener para token recebido
    PushNotifications.addListener('registration', (tokenData: Token) => {
      console.log('Push registration success:', tokenData.value);
      saveToken(tokenData.value);
    });

    // Listener para erro de registro
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      toast.error('Erro ao registrar notificações');
    });

    // Listener para notificação recebida
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      toast.info(notification.title || 'Nova notificação', {
        description: notification.body
      });
    });

    // Listener para tap na notificação
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed:', action);
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isNativePlatform, loadStoredData, saveToken]);

  return {
    token,
    optIn,
    subscriptions,
    loading,
    isNativePlatform,
    permissionGranted,
    registerPush,
    updateOptIn,
    updateSubscription,
    isFollowing
  };
}
