# Guia para criar uma aplicação Front-end com Next.js

## 1. Pré-requisitos

Verifique se o Node.js e o npm estão instalados:

```bash
node --version
npm --version
```

Caso não estejam instalados, instale a versão LTS do Node.js em:

https://nodejs.org/

## 2. Criar o projeto

```bash
npx create-next-app@latest meu-projeto
```

Durante a instalação, selecione:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
Use src/ directory: Yes
Use App Router: Yes
Customize import alias: Yes
Import alias: @/*
```

Entre na pasta:

```bash
cd meu-projeto
```

## 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## 4. Estrutura principal

```text
meu-projeto/
├── public/                  # imagens e arquivos públicos
├── src/
│   ├── app/
│   │   ├── page.tsx         # página inicial
│   │   ├── layout.tsx       # layout global
│   │   ├── globals.css      # estilos globais
│   │   └── sobre-mim/
│   │       └── page.tsx     # rota /sobre-mim
│   └── components/          # componentes reutilizáveis
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 5. Criar uma nova página

Crie uma pasta e um arquivo `page.tsx`:

```bash
mkdir -p src/app/projetos
```

Exemplo:

```tsx
export default function Projetos() {
  return (
    <main>
      <h1>Meus projetos</h1>
    </main>
  );
}
```

A página estará disponível em:

```text
http://localhost:3000/projetos
```

## 6. Criar um componente

Crie a pasta de componentes:

```bash
mkdir -p src/components
```

Exemplo de componente:

```tsx
type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return <button>{children}</button>;
}
```

Utilização:

```tsx
import Button from "@/components/Button";

export default function Home() {
  return <Button>Entrar em contato</Button>;
}
```

## 7. Adicionar imagens

Coloque a imagem em:

```text
public/images/perfil.png
```

Utilize no componente:

```tsx
<img src="/images/perfil.png" alt="Descrição da imagem" />
```

Ou, preferencialmente, use o componente otimizado do Next.js:

```tsx
import Image from "next/image";

<Image
  src="/images/perfil.png"
  alt="Descrição da imagem"
  width={400}
  height={400}
/>
```

## 8. Instalar dependências adicionais

Exemplo com ícones:

```bash
npm install lucide-react
```

Exemplo com animações:

```bash
npm install framer-motion
```

Depois de instalar dependências, o `package.json` será atualizado automaticamente.

## 9. Verificar o código

Executar o ESLint:

```bash
npm run lint
```

Verificar a compilação:

```bash
npm run build
```

## 10. Executar em produção

Depois de executar o build:

```bash
npm run start
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

## 11. Comandos úteis

```bash
npm run dev       # inicia o ambiente de desenvolvimento
npm run lint      # verifica problemas no código
npm run build     # cria a versão de produção
npm run start     # inicia a versão de produção
npm install       # instala as dependências
npm update        # atualiza as dependências
```

## 12. Inicializar um repositório Git

```bash
git init
git add .
git commit -m "Cria aplicação Next.js"
```

Adicionar um repositório remoto:

```bash
git remote add origin URL_DO_REPOSITORIO
git branch -M main
git push -u origin main
```

## 13. Variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Utilize no código:

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

Variáveis que precisam estar disponíveis no navegador devem começar com:

```text
NEXT_PUBLIC_
```

## 14. Criar para deploy

```bash
npm run build
npm run start
```

A aplicação pode ser publicada facilmente na Vercel conectando o repositório GitHub ao projeto.