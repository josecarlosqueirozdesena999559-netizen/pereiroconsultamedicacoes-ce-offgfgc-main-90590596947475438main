import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const WHATSAPP_BOT_URL =
  'https://wa.me/5511964138730?text=Ola%21%20Quero%20consultar%20um%20medicamento%20no%20ConsultMed.';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isRejected = localStorage.getItem('play-test-dismissed');
    const lastRejectedTime = localStorage.getItem('play-test-dismissed-time');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    if (isInstalled) return;

    const shouldShowAfter7Days =
      !!lastRejectedTime && Date.now() - parseInt(lastRejectedTime, 10) > 7 * 24 * 60 * 60 * 1000;

    if (!isRejected || shouldShowAfter7Days) {
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleOpenWhatsApp = () => {
    window.open(WHATSAPP_BOT_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('play-test-dismissed', 'true');
    localStorage.setItem('play-test-dismissed-time', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="mx-auto max-w-sm border border-primary/20 bg-card/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">Consulte tambem pelo WhatsApp</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Fale com o bot do ConsultMed e consulte medicamentos de forma mais facil,
              digitando apenas o nome do remedio.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Numero do bot: <strong className="text-foreground">11 96413-8730</strong>
            </p>

            <div className="mt-3 flex gap-2">
              <Button onClick={handleOpenWhatsApp} size="sm" className="h-8 gap-1.5 px-3 text-xs">
                <MessageCircle className="h-3 w-3" />
                Abrir WhatsApp do bot
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Depois
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-auto flex-shrink-0 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
