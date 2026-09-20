FROM ubuntu:24.04

LABEL maintainer="Taylor Otwell"

ARG WWWGROUP
ARG NODE_VERSION=22
ARG MYSQL_CLIENT="mysql-client"

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
ENV SUPERVISOR_PHP_COMMAND="/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan serve --host=0.0.0.0 --port=80"
ENV SUPERVISOR_PHP_USER="sail"

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Configurações apt para retry e tolerância a rede instável
RUN echo "Acquire::Retries \"5\";" > /etc/apt/apt.conf.d/99custom \
    && echo "Acquire::ForceIPv4 \"true\";" >> /etc/apt/apt.conf.d/99custom \
    && echo "Acquire::http::Pipeline-Depth \"0\";" >> /etc/apt/apt.conf.d/99custom

# Pacotes base do sistema incluindo software-properties-common para add-apt-repository
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
       gnupg gosu curl ca-certificates zip unzip git supervisor sqlite3 \
       libcap2-bin libpng-dev python3 dnsutils librsvg2-bin fswatch ffmpeg nano \
       software-properties-common \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Adiciona PPA ondrej/php via add-apt-repository
# Método mais confiável: não depende de keyserver externo com timeout
RUN LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php -y

# Instala PHP 8.3 e extensões necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
       php8.3-cli php8.3-dev \
       php8.3-sqlite3 php8.3-gd \
       php8.3-curl \
       php8.3-imap php8.3-mysql php8.3-mbstring \
       php8.3-xml php8.3-zip php8.3-bcmath php8.3-soap \
       php8.3-intl php8.3-readline \
       php8.3-msgpack php8.3-igbinary php8.3-redis \
       php8.3-memcached php8.3-imagick \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala o Composer
RUN curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer

# Instala Node.js (necessário para npm run build no servidor)
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs poppler-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala MySQL client
RUN apt-get update \
    && apt-get install -y --no-install-recommends $MYSQL_CLIENT \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN setcap "cap_net_bind_service=+ep" /usr/bin/php8.3

RUN userdel -r ubuntu 2>/dev/null || true
RUN groupadd --force -g $WWWGROUP sail
RUN useradd -ms /bin/bash --no-user-group -g $WWWGROUP -u 1337 sail

COPY start-container /usr/local/bin/start-container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY php.ini /etc/php/8.3/cli/conf.d/99-sail.ini
RUN chmod +x /usr/local/bin/start-container

EXPOSE 80/tcp

ENTRYPOINT ["start-container"]
