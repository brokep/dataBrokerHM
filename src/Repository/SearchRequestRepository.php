<?php

namespace App\Repository;

use App\Entity\SearchRequest;
use DateTime;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
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

    public function get(string $fname, string $lname, string $city, ?string $state, DateTime $period)
    {
        $qb = $this->createQueryBuilder('sr');

        $qb
            ->where($qb->expr()->eq('sr.firstname', ':fname'))->setParameter('fname', $fname)
            ->andWhere($qb->expr()->eq('sr.lastname', ':lname'))->setParameter('lname', $lname)
            ->andWhere($qb->expr()->eq('sr.city', ':city'))->setParameter('city', $city)
            ->andWhere($qb->expr()->eq('sr.state', ':state'))->setParameter('state', $state)
            ->andWhere($qb->expr()->gte('sr.createdAt', ':created'))->setParameter('created', $period);

        try {
            return $qb->getQuery()->getSingleResult();
        } catch (NoResultException|NonUniqueResultException $e) {
            return null;
        }
    }
//
//    public function getLast(int $number, string $order): array
//    {
//        $qb = $this->createQueryBuilder('sr');
//
//        $qb
//            ->join('user', 'u', 'on', 'u.id = sr.')
//            ->where($qb->expr()->eq('sr.user', ':fname'))->setParameter('fname', $fname);
//    }
}