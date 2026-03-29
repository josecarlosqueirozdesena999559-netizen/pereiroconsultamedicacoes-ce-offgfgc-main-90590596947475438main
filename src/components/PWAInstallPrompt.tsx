import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '5588997027556';
const WHATSAPP_MESSAGE = encodeURIComponent('Olá! Gostaria de consultar medicamentos pelo WhatsApp.');
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
      <Card className="p-3 shadow-lg border border-primary/20 bg-card/95 backdrop-blur-sm max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              WhatsApp
            </span>
            <h3 className="font-semibold text-base text-foreground mt-3">
              Fale com a ConsultMed
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Consulte medicamentos direto pelo WhatsApp. Clique no botão abaixo e fale com a ConsultMed.
            </p>
            <p className="text-sm font-medium text-primary mt-3">(88) 99702-7556</p>

            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={handleOpenWhatsApp}
                size="sm"
                className="text-xs h-8 px-3 bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chamar no WhatsApp
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Fechar
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1 h-auto flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
