<?php

namespace App\Controller;

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
        $firstname = $request->get('_firstname');
        $lastname = $request->get('_lastname');
        $city = $request->get('_city');
        $state = $request->get('_state');

//        $creator->create();

        return $this->render(
            'main/search.html.twig',
            ['firstname' => $firstname, 'lastname' => $lastname, 'city' => $city, 'state' => $state]
        );
    }

    #[Route(path: 'dashboard', name: 'dashboard')]
    public function dashboard(Request $request): Response
    {
        return $this->render('main/dashboard.html.twig');
    }
}