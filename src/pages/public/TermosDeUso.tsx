import PublicHeader from "@/components/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-primary">
              Termos de Uso
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto">
              <div className="space-y-6 text-sm sm:text-base text-foreground/90 leading-relaxed">
                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">1. Aceitação dos Termos</h2>
                  <p>
                    Ao acessar e utilizar o aplicativo ConsultMed, você concorda com estes Termos de Uso. 
                    Se você não concordar com qualquer parte destes termos, não deverá utilizar o aplicativo.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">2. Descrição do Serviço</h2>
                  <p>
                    O ConsultMed é um aplicativo gratuito desenvolvido pela Prefeitura Municipal de Pereiro-CE 
                    que permite aos cidadãos consultar a disponibilidade de medicamentos nas Unidades Básicas 
                    de Saúde (UBS) do município. O serviço é oferecido de forma gratuita e tem caráter 
                    exclusivamente informativo.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">3. Uso Adequado</h2>
                  <p>Ao utilizar o ConsultMed, você concorda em:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Utilizar o aplicativo apenas para fins lícitos e de consulta</li>
                    <li>Não tentar acessar áreas restritas do sistema</li>
                    <li>Não utilizar o aplicativo de forma que possa danificá-lo ou prejudicar outros usuários</li>
                    <li>Reconhecer que as informações são atualizadas periodicamente e podem não refletir a disponibilidade em tempo real</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">4. Limitação de Responsabilidade</h2>
                  <p>
                    As informações disponibilizadas no ConsultMed são de caráter meramente informativo. 
                    A Prefeitura Municipal de Pereiro não garante a disponibilidade imediata dos medicamentos 
                    listados, sendo recomendável confirmar a disponibilidade diretamente na UBS antes de 
                    se deslocar até a unidade.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">5. Disponibilidade do Serviço</h2>
                  <p>
                    Faremos o possível para manter o aplicativo disponível 24 horas por dia, 7 dias por semana. 
                    No entanto, não garantimos que o serviço estará sempre disponível, livre de erros ou 
                    interrupções para manutenção.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">6. Propriedade Intelectual</h2>
                  <p>
                    Todo o conteúdo do aplicativo, incluindo textos, gráficos, logotipos e imagens, 
                    é propriedade da Prefeitura Municipal de Pereiro ou de seus licenciadores e está 
                    protegido por leis de direitos autorais.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">7. Alterações nos Termos</h2>
                  <p>
                    Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                    As alterações entrarão em vigor imediatamente após sua publicação no aplicativo.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">8. Contato</h2>
                  <p>
                    Para dúvidas sobre estes Termos de Uso, entre em contato com a Secretaria de Saúde 
                    do Município de Pereiro através dos canais oficiais de atendimento.
                  </p>
                </section>

                <section className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    © 2025 Prefeitura Municipal de Pereiro - Secretaria de Saúde
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermosDeUso;
