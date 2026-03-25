import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Users } from 'lucide-react';
import googlePlayLogo from '@/assets/google-play-logo.png';

const GOOGLE_GROUP_URL = 'https://groups.google.com/g/testedoapp';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.consultmedpereiro.novo';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [joinedGroup, setJoinedGroup] = useState(() => {
    return localStorage.getItem('play-test-group-joined') === 'true';
  });

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

  const handleJoinGroup = () => {
    window.open(GOOGLE_GROUP_URL, '_blank', 'noopener,noreferrer');
    setJoinedGroup(true);
    localStorage.setItem('play-test-group-joined', 'true');
  };

  const handleDownload = () => {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
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
          <img src={googlePlayLogo} alt="Google Play" className="mt-0.5 h-10 w-10 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">Teste nosso app</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {joinedGroup
                ? 'Voce ja entrou no grupo. Agora baixe o app na Play Store.'
                : 'Entre no grupo de teste para ter acesso ao download do app na Play Store.'}
            </p>

            <div className="mt-3 flex gap-2">
              {!joinedGroup ? (
                <Button onClick={handleJoinGroup} size="sm" className="h-8 gap-1.5 px-3 text-xs">
                  <Users className="h-3 w-3" />
                  Entrar no grupo
                </Button>
              ) : (
                <Button onClick={handleDownload} size="sm" className="h-8 gap-1.5 px-3 text-xs">
                  <Download className="h-3 w-3" />
                  Baixar app
                </Button>
              )}
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
