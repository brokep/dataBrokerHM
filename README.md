###Steps
- `git clone <link>`
- СОздаем .env
- `docker-compose up -d`
- Заходим в контейнер `docker-compose exec php bash`
- `composer install`
- `npm install`
- `bin/console doctrine:migrations:migrate`
- Создать пароль для юзера `bin/console security:hash-password`
- Установить браузер `cd ./node_modules/puppeteer` & `npm run install`
- Теперь заходим в контейнер бд `docker-compose exec mysql bash`
- `mysql -u <user> -p`
- `use <db_name>`
- `insert into user (username, roles, password) VALUES("<username>", "[\"ROLE_USER\"]", "<pass>");`
- Далее выходим из всех контейнеров. Поднимаемся на уровень выше корневой директории проекта
  и передаем права на директорию юзеру ПХП. `chown -R www-data:www-data <folder name>`
- Ставим крон джобу на `docker-compose run php bin/console app:run-parsers`
- На этом месте все говото, но нужно еще прописать креды для проксей в файл parsers/config.json.

###Xdebug 

- create server with name Docker
- create remote interpreter



apt install xvfb
Xvfb :10 -ac &
export DISPLAY=:10
