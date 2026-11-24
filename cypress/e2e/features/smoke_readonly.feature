# language: pt
@smoke @read_only
Funcionalidade: Smoke READ_ONLY
Como membro do time CertiQA
Quero validar que a aplicação responde sem autenticação
Para ter um smoke seguro antes dos E2E mutáveis

Cenário: Home do CertiQA carrega
Dado que estou na página inicial do CertiQA
Então a home deve exibir opções de acesso

Cenário: Página de login carrega sem autenticar
Dado que estou na página inicial do CertiQA
Quando acesso a página de login
Então o formulário de login deve ser exibido
