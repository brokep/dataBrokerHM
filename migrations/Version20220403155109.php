<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220403155109 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE search_request (id INT AUTO_INCREMENT NOT NULL, firstname VARCHAR(255) DEFAULT NULL, lastname VARCHAR(255) DEFAULT NULL, city VARCHAR(255) DEFAULT NULL, state VARCHAR(255) DEFAULT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE search_result (id INT AUTO_INCREMENT NOT NULL, search_request_id INT DEFAULT NULL, parser_name VARCHAR(255) DEFAULT NULL, fullname VARCHAR(255) DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, link VARCHAR(500) DEFAULT NULL, age link VARCHAR(30) DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_CA88AE0C9AC8886F (search_request_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE users_search_requests (user_id INT NOT NULL, search_request_id INT NOT NULL, INDEX IDX_D0A7827EA76ED395 (user_id), INDEX IDX_D0A7827E9AC8886F (search_request_id), PRIMARY KEY(user_id, search_request_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE search_result ADD CONSTRAINT FK_CA88AE0C9AC8886F FOREIGN KEY (search_request_id) REFERENCES search_request (id)');
        $this->addSql('ALTER TABLE users_search_requests ADD CONSTRAINT FK_D0A7827EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE users_search_requests ADD CONSTRAINT FK_D0A7827E9AC8886F FOREIGN KEY (search_request_id) REFERENCES search_request (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE search_result DROP FOREIGN KEY FK_CA88AE0C9AC8886F');
        $this->addSql('ALTER TABLE users_search_requests DROP FOREIGN KEY FK_D0A7827E9AC8886F');
        $this->addSql('ALTER TABLE users_search_requests DROP FOREIGN KEY FK_D0A7827EA76ED395');
        $this->addSql('DROP TABLE search_request');
        $this->addSql('DROP TABLE search_result');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE users_search_requests');
    }
}
