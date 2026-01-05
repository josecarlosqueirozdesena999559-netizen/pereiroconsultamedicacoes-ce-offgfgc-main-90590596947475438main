import { useEffect } from 'react';
import { Bell, BellOff, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePostos } from '@/hooks/usePostos';

export function NotificationPreferences() {
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

  const { postos, loading: postosLoading } = usePostos();

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
            Baixe o app para receber alertas quando suas UBS favoritas atualizarem a lista de medicamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const loading = pushLoading || postosLoading;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {optIn ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas quando suas UBS favoritas atualizarem a lista de medicamentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle principal */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-toggle" className="text-base font-medium">
              Receber notificações
            </Label>
            <p className="text-sm text-muted-foreground">
              {optIn ? 'Ativado' : 'Desativado'}
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-11 rounded-full" />
          ) : (
            <Switch
              id="notifications-toggle"
              checked={optIn}
              onCheckedChange={(checked) => {
                if (checked && !token) {
                  registerPush();
                } else {
                  updateOptIn(checked);
                }
              }}
            />
          )}
        </div>

        {/* Lista de UBS para seguir */}
        {optIn && token && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Seguir UBS</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione as UBS das quais deseja receber notificações:
            </p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {postos.map((posto) => (
                  <div
                    key={posto.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`ubs-${posto.id}`}
                      checked={isFollowing(posto.id)}
                      onCheckedChange={(checked) => {
                        updateSubscription(posto.id, checked === true);
                      }}
                    />
                    <Label
                      htmlFor={`ubs-${posto.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-medium">{posto.nome}</span>
                      <span className="block text-sm text-muted-foreground">
                        {posto.localidade}
                      </span>
                    </Label>
                  </div>
                ))}

                {postos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma UBS disponível.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
