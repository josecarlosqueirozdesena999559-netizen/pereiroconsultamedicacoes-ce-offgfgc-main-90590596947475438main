import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const WHATSAPP_NUMBER = '5588997027556';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Oi',
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('consultmed-whatsapp-dismissed');
    const dismissedAt = localStorage.getItem('consultmed-whatsapp-dismissed-time');

    const shouldShowAgain =
      !!dismissedAt && Date.now() - parseInt(dismissedAt, 10) > 24 * 60 * 60 * 1000;

    if (!wasDismissed || shouldShowAgain) {
      const timer = window.setTimeout(() => setShowPrompt(true), 2000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleOpenWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('consultmed-whatsapp-dismissed', 'true');
    localStorage.setItem('consultmed-whatsapp-dismissed-time', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="mx-auto max-w-sm overflow-hidden border border-green-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,244,0.98))] p-4 shadow-[0_18px_45px_rgba(34,197,94,0.18)] backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm ring-4 ring-green-100/80">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-green-700">
              Atendimento online
            </div>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Fale com a Consult Med</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Tire duvidas, receba orientacao e continue seu atendimento direto pelo WhatsApp.
            </p>
            <p className="mt-2 text-xs font-medium text-green-700">(88) 99702-7556</p>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleOpenWhatsApp}
                size="sm"
                className="h-9 gap-1.5 rounded-full bg-green-600 px-4 text-xs text-white hover:bg-green-700"
              >
                <MessageCircle className="h-3 w-3" />
                Chamar no WhatsApp
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Fechar
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-auto flex-shrink-0 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar aviso"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
