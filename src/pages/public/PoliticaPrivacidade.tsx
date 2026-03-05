import PublicHeader from "@/components/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-primary">
              Política de Privacidade
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto">
              <div className="space-y-6 text-sm sm:text-base text-foreground/90 leading-relaxed">
                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">1. Introdução</h2>
                  <p>
                    A Prefeitura Municipal de Pereiro-CE, através do aplicativo ConsultMed, está 
                    comprometida em proteger a privacidade dos usuários. Esta Política de Privacidade 
                    explica como coletamos, usamos e protegemos suas informações.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">2. Dados Coletados</h2>
                  <p>O ConsultMed pode coletar os seguintes tipos de informações:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li><strong>Dados de uso:</strong> Páginas visitadas, tempo de uso e funcionalidades acessadas</li>
                    <li><strong>Dados do dispositivo:</strong> Tipo de dispositivo, sistema operacional e versão do aplicativo</li>
                    <li><strong>Notificações push:</strong> Token do dispositivo para envio de notificações (apenas se você autorizar)</li>
                    <li><strong>Preferências:</strong> UBS favoritas para recebimento de atualizações</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">3. Uso dos Dados</h2>
                  <p>Utilizamos os dados coletados para:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Enviar notificações sobre atualizações de medicamentos nas UBS que você segue</li>
                    <li>Analisar o uso do aplicativo para melhorias</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">4. Compartilhamento de Dados</h2>
                  <p>
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros 
                    para fins comerciais. Os dados podem ser compartilhados apenas:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Com autoridades públicas, quando exigido por lei</li>
                    <li>Com prestadores de serviços técnicos necessários ao funcionamento do aplicativo</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">5. Segurança dos Dados</h2>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
                    informações contra acesso não autorizado, alteração, divulgação ou destruição. 
                    Utilizamos criptografia e servidores seguros para armazenamento de dados.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">6. Seus Direitos</h2>
                  <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Acessar seus dados pessoais</li>
                    <li>Corrigir dados incompletos ou desatualizados</li>
                    <li>Solicitar a exclusão de seus dados</li>
                    <li>Revogar o consentimento para notificações</li>
                    <li>Obter informações sobre o compartilhamento de dados</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">7. Notificações Push</h2>
                  <p>
                    As notificações push são opcionais e podem ser desativadas a qualquer momento 
                    através das configurações do aplicativo ou do seu dispositivo. Quando você 
                    desativa as notificações, seu token de push é marcado como inativo em nosso sistema.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">8. Cookies e Armazenamento Local</h2>
                  <p>
                    Utilizamos armazenamento local (localStorage) para salvar suas preferências 
                    e melhorar sua experiência. Esses dados permanecem apenas no seu dispositivo 
                    e podem ser excluídos limpando os dados do aplicativo.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">9. Alterações nesta Política</h2>
                  <p>
                    Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos 
                    revisar esta página regularmente para estar ciente de quaisquer alterações.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-lg text-primary mb-2">10. Contato</h2>
                  <p>
                    Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                    entre em contato com a Secretaria de Saúde do Município de Pereiro através dos 
                    canais oficiais de atendimento.
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

export default PoliticaPrivacidade;
