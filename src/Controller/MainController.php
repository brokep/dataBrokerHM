<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends AbstractController
{
    /**
     * @Route("/", name="home")
     */
    public function index(): Response
    {
        return $this->render('main/index.html.twig');
    }

    /**
     * @Route("/search", name="search")
     */
    public function searchPage(Request $request)
    {
        $firstname = $request->get('_firstname');
        $lastname = $request->get('_lastname');
        $city = $request->get('_city');
        $state = $request->get('_state');

        return $this->render(
            'main/search.html.twig',
            ['firstname' => $firstname, 'lastname' => $lastname, 'city' => $city, 'state' => $state]
        );
    }
}
