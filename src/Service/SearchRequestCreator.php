<?php

namespace App\Service;

use App\Entity\SearchRequest;
use App\Entity\User;
use App\Enum\SearchRequestStatus;
use App\Repository\SearchRequestRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;

class SearchRequestCreator
{
    public function __construct(
        private SearchRequestRepository $searchRequestRepository,
     ) {}

    /**
     * @param UserInterface|User $user
     * @throws AlreadyExistsException
     */
    public function create(UserInterface $user, string $fname, string $lname, string $city, ?string $state)
    {
        /** @var SearchRequest|null $res */
        $searchPeriod = new DateTime('-2 day'); // from 2 days until now
        $res = $this->searchRequestRepository->get($fname, $lname, $city, $state, $searchPeriod);

        if ($res) {
            if ($user->getSearchRequests()->contains($res)) {
                throw new AlreadyExistsException('Search request already exists');
            }

            $user->addSearchRequests($res);
            $res->addUsers($user);
            $this->searchRequestRepository->save($res);

            return $res;
        }

        $request = new SearchRequest();
        $request->setFirstname($fname);
        $request->setLastname($lname);
        $request->setCity($city);
        $request->setState($state);
        $request->setStatus(SearchRequestStatus::NEW);
        $request->setUsers(new ArrayCollection([$user]));
        $request->setCreatedAt(new \DateTime());
        $user->addSearchRequests($request);
        $this->searchRequestRepository->save($request);

        return $request;
    }
}