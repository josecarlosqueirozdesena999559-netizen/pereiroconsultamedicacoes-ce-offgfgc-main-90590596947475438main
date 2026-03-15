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

    const shouldShowAfter7Days = lastRejectedTime &&
      (Date.now() - parseInt(lastRejectedTime)) > 7 * 24 * 60 * 60 * 1000;

    if (!isRejected || shouldShowAfter7Days) {
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleJoinGroup = () => {
    window.open(GOOGLE_GROUP_URL, '_blank');
    setJoinedGroup(true);
    localStorage.setItem('play-test-group-joined', 'true');
  };

  const handleDownload = () => {
    window.open(PLAY_STORE_URL, '_blank');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('play-test-dismissed', 'true');
    localStorage.setItem('play-test-dismissed-time', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 shadow-lg border border-primary/20 bg-card/95 backdrop-blur-sm max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <img
            src={googlePlayLogo}
            alt="Google Play"
            className="h-10 w-10 flex-shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">
              📱 Teste nosso App!
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {joinedGroup
                ? 'Você já entrou no grupo! Agora baixe o app na Play Store.'
                : 'Entre no grupo de teste para ter acesso ao download do app na Play Store.'}
            </p>

            <div className="flex gap-2 mt-3">
              {!joinedGroup ? (
                <Button
                  onClick={handleJoinGroup}
                  size="sm"
                  className="text-xs h-8 px-3 gap-1.5"
                >
                  <Users className="h-3 w-3" />
                  Entrar no grupo
                </Button>
              ) : (
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="text-xs h-8 px-3 gap-1.5"
                >
                  <Download className="h-3 w-3" />
                  Baixar App
                </Button>
              )}
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Depois
              </Button>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1 h-auto flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
