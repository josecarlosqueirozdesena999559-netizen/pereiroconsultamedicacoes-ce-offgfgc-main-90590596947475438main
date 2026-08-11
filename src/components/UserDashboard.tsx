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
  const [updateChecks, setUpdateChecks] = useState<
    Record<string, { manha: boolean; tarde: boolean }>
  >({});
  const { user } = useAuth();
  const { toast } = useToast();

  const todayFormattedDate = useMemo(
    () => new Date().toLocaleDateString("pt-BR"),
    []
  );

  const getUploadScheduleInfo = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    const isFriday = dayOfWeek === 5;
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let currentPeriod: "manha" | "tarde" | null = null;
    let isWithinSchedule = false;
    let currentPeriodLabel = "";
    let scheduleMessage = "";

    if (isWeekend) {
      scheduleMessage = "Uploads não disponíveis nos finais de semana.";
    } else if (isFriday) {
      isWithinSchedule = hour >= 7 && hour < 17;
      if (isWithinSchedule) {
        currentPeriod = hour < 12 ? "manha" : "tarde";
        currentPeriodLabel = "Manhã + Tarde";
        scheduleMessage = "Sexta: upload único conta como manhã e tarde (07h-17h).";
      } else {
        scheduleMessage = "Fora do horário de envio de sexta (07h-17h).";
      }
    } else if (isWeekday) {
      if (hour >= 7 && hour < 12) {
        currentPeriod = "manha";
        isWithinSchedule = true;
        currentPeriodLabel = "Manhã";
        scheduleMessage = "Período da manhã disponível (07h-11h).";
      } else if (hour >= 12 && hour < 17) {
        currentPeriod = "tarde";
        isWithinSchedule = true;
        currentPeriodLabel = "Tarde";
        scheduleMessage = "Período da tarde disponível (12h-17h).";
      } else {
        scheduleMessage = "Fora do horário de envio (07h-11h / 12h-17h).";
      }
    }

    return {
      isFriday,
      isWithinSchedule,
      currentPeriod,
      currentPeriodLabel,
      scheduleMessage,
    };
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

    if (file.type !== "application/pdf") {
      toast({ title: "Arquivo inv�lido", description: "Envie apenas arquivos PDF.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O PDF deve ter no m�ximo 10MB.", variant: "destructive" });
      return;
    }

    setUploadingUBS(ubsId);

    try {
      const newTimestamp = await savePDF(ubsId, file);

      if (newTimestamp) {
        const currentChecks = await getUpdateChecks(user.id, ubsId);
        const manhaChecked = currentChecks?.manha || false;
        const tardeChecked = currentChecks?.tarde || false;
        const { isFriday, currentPeriod } = getUploadScheduleInfo;

        if (isFriday) {
          if (!manhaChecked) await saveUpdateCheck(user.id, ubsId, "manha");
          if (!tardeChecked) await saveUpdateCheck(user.id, ubsId, "tarde");
        } else if (currentPeriod) {
          if (currentPeriod === "manha" && !manhaChecked) {
            await saveUpdateCheck(user.id, ubsId, "manha");
          } else if (currentPeriod === "tarde" && !tardeChecked) {
            await saveUpdateCheck(user.id, ubsId, "tarde");
          }
        }
      }

      toast({ title: "PDF enviado", description: "A lista da UBS foi atualizada com sucesso." });
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
                  isFriday,
                } = getUploadScheduleInfo;

                let canUploadNow = isWithinSchedule;
                if (canUploadNow) {
                  if (isFriday) {
                    canUploadNow = !manhaChecked && !tardeChecked;
                  } else if (currentPeriod === "manha") {
                    canUploadNow = !manhaChecked;
                  } else if (currentPeriod === "tarde") {
                    canUploadNow = !tardeChecked;
                  }
                }

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
                            <p className="text-xs text-muted-foreground">12h - 17h</p>
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
