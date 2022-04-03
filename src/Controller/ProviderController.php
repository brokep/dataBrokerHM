<?php
declare(strict_types=1);

namespace App\Controller;

use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;

class ProviderController extends AbstractController implements LoggerAwareInterface
{
    use LoggerAwareTrait;

    private const DELETION_SCRIPTS = [
        'florida' => '/parsers/deletion/florida.js',
    ];

    private const PROVIDERS = [
        'clustr' => '/parsers/clustrmaps.js',
        'fps' => '/parsers/fastpeople.js',
        'florida' => '/parsers/florida.js',
        'mylife' => '/parsers/mylife.js',
        'spokeo' => '/parsers/spokeo.js',
        'voterrecords' => '/parsers/voterrecords.js',
        'spf' => '/parsers/search_people_free.js',
        'whitepages' => '/parsers/whitepages.js',
        'nuwber' => '/parsers/nuwber.js',
        'beenverified' => '/parsers/beenverified.js',
    ];

    /**
     * @Route("/provider/{provider}", name="provider")
     */
    public function provider(Request $request, string $provider): Response
    {
        $this->logger->info("Start processing [$provider]");
        $providerPath = self::PROVIDERS[$provider] ?? null;
        if (!$providerPath) {
            $this->logger->error("Provider not found [$provider]");
            throw new BadRequestHttpException();
        }

        $this->logger->info("Provider found [$provider]");
        $firstname = $request->get('firstname');
        $lastname = $request->get('lastname');
        $location = $request->get('location');
        $fullPath = $this->getParameter('kernel.project_dir') . $providerPath;

        $command = sprintf('node %s "%s" "%s" "%s"', $fullPath, $firstname, $lastname, $location);
        exec($command, $out );

        $this->logger->info("Command finished [$provider]");
        if (!isset($out[0])) {
            $this->logger->error("Error on parsing [$provider]", [
                'site' => $provider,
                'error' => 'Empty response',
                'firstname' => $firstname,
                'lastname' => $lastname,
                'location' => $location,
            ]);
            throw new \Exception();
        }

        $this->logger->info("Decoding [$provider]");
        $result = json_decode($out[0], true);

        if ($result['error'] !== null) {
            $this->logger->error("Error on parsing [$provider]", [
                'site' => $provider,
                'error' => $result['error'],
                'firstname' => $firstname,
                'lastname' => $lastname,
                'location' => $location,
            ]);
            throw new \Exception();
        }

        $this->logger->info("Done");
        return new Response($out[0]);
    }

    /**
     * @Route("/provider/{provider}/delete", name="provider_delete")
     */
    public function delete(Request $request, string $provider)
    {
        return new Response();
        $providerPath = self::DELETION_SCRIPTS[$provider] ?? null;
        if (!$providerPath) {
            throw new BadRequestHttpException();
        }

        $link = $request->get('link');

        $this->logger->emergency(sprintf('[REMOVE REQUEST] %s. link: %s', $provider, $link));

        $fullPath = $this->getParameter('kernel.project_dir') . $providerPath;
        $command = sprintf('node %s %s', $fullPath, $link);
        exec($command, $out);

        if (!isset($out[0])) {
            $this->logger->error('Error on deletion', [
                'site' => $provider,
                'error' => 'Empty response',
                'link' => $link,
            ]);
            throw new \Exception();
        }
        $result = json_decode($out[0], true);

        if ($result['error'] !== null) {
            $this->logger->error('Error on parsing', [
                'site' => $provider,
                'error' => $result['error'],
                'link' => $link,
            ]);
            throw new \Exception();
        }
        
        return new Response($out[0]);
    }
}