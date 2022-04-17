###Steps
- Подготовка
  - `git clone <link>`
  - `cp .env.dist .env`
  - Прописываем желаемые креды для БД в .env (логин, пароль и тд)
  - `docker-compose up -d`
- Установить зависимости внутри контейнера
  - `docker-compose exec php bash`
  - `composer install`
  - `npm install`
  - `cd ./node_modules/puppeteer`
  - `npm run install`
- Подготовка БД
  - `bin/console doctrine:migrations:migrate`
  - Создать пароль для юзера `bin/console security:hash-password`
  - Теперь заходим в контейнер бд `docker-compose exec mysql bash`
  - `mysql -u <user> -p`
  - `use <db_name>`
  - `insert into user (username, roles, password) VALUES("<username>", "[\"ROLE_USER\"]", "<pass>");`
- Далее выходим из всех контейнеров. Поднимаемся на уровень выше корневой директории проекта
  и передаем права на директорию юзеру ПХП. `chown -R www-data:www-data <folder name>`
- Ставим крон джобу на `docker exec <container_id> bin/console app:run-parsers prod`
- На этом месте все говото, но нужно еще прописать креды для проксей в файл parsers/config.json.

###Xdebug 

- create server with name Docker
- create remote interpreter



apt install xvfb
Xvfb :10 -ac &
export DISPLAY=:10
