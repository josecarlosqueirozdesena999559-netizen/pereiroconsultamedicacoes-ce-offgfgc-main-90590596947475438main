import { useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationPreferencesProps {
  ubsId?: string;
  ubsNome?: string;
}

export function NotificationPreferences({ ubsId, ubsNome }: NotificationPreferencesProps) {
  const {
    token,
    optIn,
    loading: pushLoading,
    isNativePlatform,
    registerPush,
    updateOptIn,
    updateSubscription,
    isFollowing
  } = usePushNotifications();

  // Registra push ao montar (se ainda não registrado)
  useEffect(() => {
    if (isNativePlatform && !token) {
      registerPush();
    }
  }, [isNativePlatform, token, registerPush]);

  if (!isNativePlatform) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </CardTitle>
          <CardDescription>
            Notificações push estão disponíveis apenas no aplicativo Android.
            Baixe o app para receber alertas quando {ubsNome ? `"${ubsNome}"` : 'suas UBS favoritas'} atualizar a lista de medicamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isFollowingThisUbs = ubsId ? isFollowing(ubsId) : false;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {optIn && isFollowingThisUbs ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Seguir esta UBS
        </CardTitle>
        <CardDescription>
          Receba alertas quando {ubsNome ? `"${ubsNome}"` : 'esta UBS'} atualizar a lista de medicamentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle para seguir esta UBS específica */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ubs-follow-toggle" className="text-base font-medium">
              Receber notificações desta UBS
            </Label>
            <p className="text-sm text-muted-foreground">
              {optIn && isFollowingThisUbs ? 'Seguindo' : 'Não seguindo'}
            </p>
          </div>
          {pushLoading ? (
            <Skeleton className="h-6 w-11 rounded-full" />
          ) : (
            <Switch
              id="ubs-follow-toggle"
              checked={optIn && isFollowingThisUbs}
              onCheckedChange={(checked) => {
                if (!token) {
                  registerPush();
                  return;
                }
                if (!optIn && checked) {
                  updateOptIn(true);
                }
                if (ubsId) {
                  updateSubscription(ubsId, checked);
                }
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
