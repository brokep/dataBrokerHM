<?php

namespace App\Controller;

use App\Entity\SearchRequest;
use App\Entity\SearchResult;
use App\Entity\User;
use App\Repository\SearchRequestRepository;
use App\Repository\SearchResultRepository;
use App\Service\AlreadyExistsException;
use App\Service\SearchRequestCreator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Main extends AbstractController
{
    #[Route(path: '/', name: 'home')]
    public function main(): Response
    {
        return $this->render('main/index.html.twig');
    }

    #[Route(path: '/search', name: 'search')]
    public function search(Request $request, SearchRequestCreator $creator): Response
    {
        $firstname = strtolower($request->get('_firstname', ''));
        $lastname = strtolower($request->get('_lastname', ''));
        $city = strtolower($request->get('_city', ''));
        $state = strtolower($request->get('_state', ''));

        try {
            $creator->create($this->getUser(), $firstname, $lastname, $city, $state);
        } catch (AlreadyExistsException $e) {
            $this->addFlash('info', $e->getMessage());
            $lastSearches = $this->getLatsSearches(10);
            return $this->render('main/dashboard.html.twig', ['searches' => $lastSearches]);
        }

        return $this->render(
            'main/search.html.twig',
            ['firstname' => $firstname, 'lastname' => $lastname, 'city' => $city, 'state' => $state]
        );
    }

    #[Route(path: '/dashboard', name: 'dashboard')]
    public function dashboard(
        Request $request,
        SearchRequestRepository $requestRepository,
        SearchResultRepository $resultRepository
    ): Response {
        $searchId = $request->get('search_id', '');
        $lastSearches = $this->getLatsSearches(10);

        $req = $requestRepository->find($searchId);
        /** @var User $user */
        $user = $this->getUser();
        if (!$user->getSearchRequests()->contains($req)) {
            return $this->render(
                'main/dashboard.html.twig',
                [
                    'searches' => $lastSearches
                ]
            );
        }
        $results = $resultRepository->findBy(['searchRequest' => $req]);
        $results = $this->prepareResults($results);

        return $this->render(
            'main/dashboard.html.twig',
            [
                'searches' => $lastSearches,
                'results' => $results
            ]
        );
    }

    private function getLatsSearches(int $counter): array
    {
        /** @var User $user */
        $user = $this->getUser();

        $i = 0;
        $temp = [];
        /** @var SearchRequest $searchRequest */
        foreach ($user->getSearchRequests() as $searchRequest) {
            if (++$i >= $counter) {
                break;
            }

            $date = $searchRequest->getCreatedAt()->format('m-d-Y');
            $temp[$searchRequest->getId()] = [
                'id' => $searchRequest->getId(),
                'fname' => $searchRequest->getFirstname(),
                'lname' => $searchRequest->getLastname(),
                'city' => $searchRequest->getCity(),
                'date' => $date,
                'status' => $searchRequest->getStatus(),
            ];
        }

        krsort($temp);

        return $temp;
    }

    private function prepareResults(array $results): array
    {
        $temp = [];
        /** @var SearchResult $result */
        foreach ($results as $result) {
            $temp[$result->getParserName()][] = [
                'name' => $result->getFullname(),
                'address' => $result->getAddress(),
                'age' => $result->getAge(),
                'link' => $result->getLink(),
            ];
        }

        return $temp;
    }
}
