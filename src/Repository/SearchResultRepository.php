<?php

namespace App\Repository;

use App\Entity\SearchResult;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SearchResultRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SearchResult::class);
    }

    public function save(SearchResult $result)
    {
        $this->getEntityManager()->persist($result);
        $this->getEntityManager()->flush();
    }
}