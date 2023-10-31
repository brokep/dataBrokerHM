###Steps
Preparation

    git clone <link>
    cp .env.dist .env
    Add the desired credentials for the database in .env (login, password, etc.)
    docker-compose up -d

Install Dependencies Inside the Container

    docker-compose exec php bash
    composer install
    npm install
    cd ./node_modules/puppeteer
    npm run install

Database Preparation

    bin/console doctrine:migrations:migrate
    Create a password for the user using bin/console security:hash-password
    Now enter the database container docker-compose exec mysql bash
    mysql -u <user> -p
    use <db_name>
    insert into user (username, roles, password) VALUES("<username>", "[\"ROLE_USER\"]", "<pass>");

Further Steps

    Exit all containers. Move up one level from the project's root directory and transfer folder ownership to the PHP user. chown -R www-data:www-data <folder name>

Set Up Cron Job

    Set up a cron job using docker exec <container_id> bin/console app:run-parsers prod

Final Note

    At this point, everything is ready, but you still need to add proxy credentials in the parsers/config.json file.


###Xdebug 

- create server with name Docker
- create remote interpreter



apt install xvfb
Xvfb :10 -ac &
export DISPLAY=:10
