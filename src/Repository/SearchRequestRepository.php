<?php

namespace App\Repository;

use App\Entity\SearchRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SearchRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SearchRequest::class);
    }

    public function save(SearchRequest $searchRequest)
    {
        $this->getEntityManager()->persist($searchRequest);
        $this->getEntityManager()->flush();
    }
}