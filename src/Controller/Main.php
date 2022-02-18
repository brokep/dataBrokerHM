<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Main extends AbstractController
{
    #[Route('/main', name: 'main')]
    public function main(): Response
    {
        return new Response('Hello');
    }
}