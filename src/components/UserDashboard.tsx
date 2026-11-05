import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Download, AlertCircle, Clock, FileText } from "lucide-react";
import { UBS } from "@/types";
import { getUBS, savePDF, getUpdateChecks, saveUpdateCheck } from "@/lib/storage";
import CorrectionRequestModal from "./CorrectionRequestModal";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [uploadingUBS, setUploadingUBS] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [updateChecks, setUpdateChecks] = useState<
    Record<string, { manha: boolean; tarde: boolean }>
  >({});
  const { user } = useAuth();
  const { toast } = useToast();

  const todayFormattedDate = useMemo(
    () => currentTime.toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" }),
    [currentTime]
  );

  const getUploadScheduleInfo = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Fortaleza",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(currentTime);
    const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
    const totalMinutes = hour * 60 + minute;
    const currentPeriod = totalMinutes >= 7 * 60 && totalMinutes < 11 * 60
      ? "manha" as const
      : totalMinutes >= 13 * 60 && totalMinutes < 17 * 60
      ? "tarde" as const
      : null;

    return {
      isWithinSchedule: currentPeriod !== null,
      currentPeriod,
      currentPeriodLabel: currentPeriod === "manha" ? "Manhã" : currentPeriod === "tarde" ? "Tarde" : "",
      scheduleMessage: currentPeriod
        ? "Período da " + (currentPeriod === "manha" ? "manhã" : "tarde") + " disponível (" + (currentPeriod === "manha" ? "07h-11h" : "13h-17h") + ")."
        : "Envios todos os dias: manhã 07h-11h e tarde 13h-17h.",
    };
  }, [currentTime]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadUserUBS();
  }, [user]);

  const loadUpdateChecksForUBS = async (ubsId: string) => {
    if (!user) return;
    const checks = await getUpdateChecks(user.id, ubsId);
    setUpdateChecks((prev) => ({
      ...prev,
      [ubsId]: checks ?? { manha: false, tarde: false },
    }));
  };

  const loadUserUBS = async () => {
    try {
      const allUBS = await getUBS();
      const userUBS = allUBS.filter((ubs) => user?.ubsVinculadas.includes(ubs.id));
      setUbsList(userUBS);
      await Promise.all(userUBS.map((ubs) => loadUpdateChecksForUBS(ubs.id)));
    } catch (error) {
      console.error("Erro ao carregar UBS do usuário:", error);
    }
  };

  const isComplete = (ubsId: string) => {
    const checks = updateChecks[ubsId];
    return !!(checks?.manha && checks?.tarde);
  };

  const handleFileUpload = async (ubsId: string, file: File) => {
    if (!file || !user) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.type === "application/x-pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast({
        title: "Arquivo inválido",
        description: "Envie apenas arquivos PDF.",
        variant: "destructive",
      });
      return;
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo tem ${(file.size / (1024 * 1024)).toFixed(1)}MB. O PDF deve ter no máximo 100MB.`,
        variant: "destructive",
      });
      return;
    }

    setUploadingUBS(ubsId);
    toast({
      title: "Enviando PDF...",
      description: `Iniciando upload de "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB)... `,
    });

    try {
      const { currentPeriod } = getUploadScheduleInfo;
      const newTimestamp = await savePDF(ubsId, file);

      if (newTimestamp && currentPeriod) {
        const currentChecks = await getUpdateChecks(user.id, ubsId);
        const alreadySent = currentPeriod === "manha" ? currentChecks?.manha : currentChecks?.tarde;
        if (!alreadySent) await saveUpdateCheck(user.id, ubsId, currentPeriod);
      }

      toast({
        title: "Envio da " + (currentPeriod === "manha" ? "manhã" : "tarde") + " confirmado",
        description: "O PDF foi recebido e a lista pesquisável de medicamentos foi atualizada.",
      });
    } catch (error) {
      console.error("Erro durante o upload:", error);
      const description = error instanceof Error ? error.message : "N�o foi poss�vel salvar o PDF. Tente novamente.";
      toast({ title: "Erro ao enviar PDF", description, variant: "destructive" });
    } finally {
      setUploadingUBS(null);
      await loadUserUBS();
    }
  };

  const triggerFileInput = (ubsId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(ubsId, file);
    };
    input.click();
  };

  const handleDownload = (ubs: UBS) => {
    if (!ubs.pdfUrl) return;
    const link = document.createElement("a");
    link.href = ubs.pdfUrl;
    link.download = `medicacoes_${ubs.nome.replace(/\s+/g, "_")}.pdf`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-5">
          <Card className="border-primary/15">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">Gestão de PDF</h2>
                <p className="text-sm text-muted-foreground">
                  Envie o PDF da sua unidade e acompanhe as atualizações do dia.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>Hoje: {todayFormattedDate}</span>
              </div>
            </CardContent>
          </Card>

          {ubsList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhuma UBS vinculada</h3>
                <p className="text-sm text-muted-foreground">
                  Solicite o vínculo ao administrador.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ubsList.map((ubs) => {
                const manhaChecked = updateChecks[ubs.id]?.manha || false;
                const tardeChecked = updateChecks[ubs.id]?.tarde || false;
                const complete = isComplete(ubs.id);
                const {
                  isWithinSchedule,
                  currentPeriod,
                  currentPeriodLabel,
                  scheduleMessage,
                } = getUploadScheduleInfo;

                let canUploadNow = isWithinSchedule;
                if (currentPeriod === "manha") canUploadNow = canUploadNow && !manhaChecked;
                if (currentPeriod === "tarde") canUploadNow = canUploadNow && !tardeChecked;

                return (
                  <Card
                    key={ubs.id}
                    className={
                      complete
                        ? "border-green-300 bg-green-50/50 dark:bg-green-950/10"
                        : "border-primary/15"
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold">{ubs.nome}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{ubs.localidade}</p>
                        </div>
                        {complete && (
                          <span className="inline-flex w-fit rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Completo
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{scheduleMessage}</span>
                        </div>
                        {ubs.pdfUltimaAtualizacao && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Última atualização: {ubs.pdfUltimaAtualizacao}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div
                          className={`flex items-center gap-2 rounded-lg border p-3 ${
                            manhaChecked
                              ? "bg-green-50 border-green-300 dark:bg-green-950/30"
                              : "bg-muted/30 border-border"
                          }`}
                        >
                          <Checkbox
                            checked={manhaChecked}
                            disabled
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                manhaChecked
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Manhã
                            </p>
                            <p className="text-xs text-muted-foreground">07h - 11h</p>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-2 rounded-lg border p-3 ${
                            tardeChecked
                              ? "bg-green-50 border-green-300 dark:bg-green-950/30"
                              : "bg-muted/30 border-border"
                          }`}
                        >
                          <Checkbox
                            checked={tardeChecked}
                            disabled
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                tardeChecked
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Tarde
                            </p>
                            <p className="text-xs text-muted-foreground">13h - 17h</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => triggerFileInput(ubs.id)}
                          disabled={uploadingUBS === ubs.id || complete || !canUploadNow}
                          className="w-full"
                          variant={complete ? "outline" : "default"}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingUBS === ubs.id
                            ? "Enviando..."
                            : complete
                            ? "Atualização completa"
                            : !isWithinSchedule
                            ? "Fora do horário"
                            : !canUploadNow
                            ? `${currentPeriod === "manha" ? "Manhã" : "Tarde"} já enviado`
                            : `Enviar PDF${currentPeriodLabel ? ` (${currentPeriodLabel})` : ""}`}
                        </Button>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {ubs.pdfUrl ? (
                            <Button
                              onClick={() => handleDownload(ubs)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Baixar PDF atual
                            </Button>
                          ) : (
                            <div className="hidden sm:block" />
                          )}

                          <CorrectionRequestModal
                            ubsId={ubs.id}
                            ubsName={ubs.nome}
                            onSuccess={loadUserUBS}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
