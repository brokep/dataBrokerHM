FROM php:8.1.3RC1-fpm

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y apt-utils wget git unzip zip libzip-dev nodejs npm libgbm-dev procps

RUN apt-get install -y apt-utils gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1

RUN apt-get install -y apt-utils libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6

RUN apt-get install -y apt-utils libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2

RUN apt-get install -y apt-utils libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils


RUN pecl install xdebug \
    && docker-php-ext-install zip pdo pdo_mysql \
    && docker-php-ext-enable xdebug

#RUN apt-get update && apt-get install -y wget git unzip zip libzip-dev nodejs npm libgbm-dev \
#	gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1  \
#	libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
#	libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
#	libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils \
#    && pecl install xdebug-3.0.4 \
#    && docker-php-ext-enable xdebug \
#    && docker-php-ext-install zip pdo pdo_mysql

RUN wget https://getcomposer.org/installer -O - -q \
    | php -- --install-dir=/bin --filename=composer --quiet

WORKDIR /var/www

#COPY composer.json /root/parser/composer.json
#COPY composer.lock /root/parser/composer.lock

#RUN composer install --prefer-source --no-interaction
#RUN npm install

