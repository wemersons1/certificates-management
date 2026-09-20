FROM node:20-bookworm

WORKDIR /usr/src/app

# Copia manifests primeiro — npm install e Playwright ficam em camadas separadas do código
# Só re-executa quando package.json ou package-lock.json mudam
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
RUN npx playwright install chromium --with-deps

# Código da aplicação em camada separada — mudanças aqui não invalidam o cache acima
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
