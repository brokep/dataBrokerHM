<?php

namespace App\Command;

use App\Entity\SearchRequest;
use App\Entity\SearchResult;
use App\Enum\Parsers;
use App\Enum\SearchRequestStatus;
use App\Repository\SearchRequestRepository;
use App\Repository\SearchResultRepository;
use DateTime;
use Generator;
use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;
use Symfony\Component\Process\Process;
use Throwable;

#[AsCommand(
    name: 'app:run-parsers',
    description: '',
)]
class RunParsers extends Command implements LoggerAwareInterface
{
    use LoggerAwareTrait;

    private const TIMEOUT_8_MIN = 500;
    private const OPT = 'env-name';

    private Generator $parsers;

    public function __construct(
        private ContainerBagInterface $params,
        private SearchRequestRepository $searchRequestRepository,
        private SearchResultRepository $searchResultRepository
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->addArgument(self::OPT, InputArgument::REQUIRED, 'set `dev` to make requests to test sites or `prod`');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $res = $this->searchRequestRepository->findBy(['status' => SearchRequestStatus::IN_PROGRESS]);
        if (count($res) > 0) {
            $this->logger->info('There is active job running');
            return self::SUCCESS;
        }

        /** @var SearchRequest $res */
        $res = $this->searchRequestRepository->findOneBy(['status' => SearchRequestStatus::NEW]);

        if (!$res) {
            return self::SUCCESS;
        }

        try {
            $res->setStatus(SearchRequestStatus::IN_PROGRESS);
            $this->searchRequestRepository->save($res);
            $this->parsers = $this->getParsersIterator($input->getArgument(self::OPT));
            $this->logger->info('Start process job: ' . $res->getId());

            $this->process($res);
        } catch (Throwable $e) {
            $this->logger->error(
                "Something terrible",
                ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'requestId' => $res->getId()]
            );
            $res->setStatus(SearchRequestStatus::ERROR);
            $this->searchRequestRepository->save($res);
            return self::FAILURE;
        }

        $this->logger->info('Request finished ' . $res->getId());
        return self::SUCCESS;
    }

    private function process(SearchRequest $request)
    {
        foreach ($this->parsers as $parser) {
            $process = $this->addNewProcess($request, $parser);

            $this->checkRunningProcess($request, $process, $parser);
        }

        $request->setStatus(SearchRequestStatus::DONE);
        $this->searchRequestRepository->save($request);
    }

    private function getParsersIterator(string $env): Generator
    {
        if ($env == 'dev') {
            $this->logger->info('Get dev parsers');
            foreach (Parsers::TEST_PARSER as $parser) {
                yield $parser;
            }
        } else {
            $this->logger->info('Get prod parsers');
            foreach (Parsers::PARSERS as $parser) {
                yield $parser;
            }
        }
    }

    private function checkRunningProcess(SearchRequest $res, Process $process, $parser)
    {
        $tryCount = 1;
        while (true) {
            if ($process->isRunning()) {
                sleep(1);

                continue;
            }

            if ($process->isSuccessful()) {
                $out = json_decode($process->getOutput(), true);

                if ($out['error'] !== null) {
                    $this->logger->error("Error inside parser. Trying again. Try count: $tryCount", [
                        'name' => $parser['name'],
                        'error' => $out['error'],
                    ]);

                    if ($tryCount > 3) {
                        $this->logger->info('Try count exceed. Name: '. $parser['name']);
                        unset($process);
                        break;
                    }

                    $tryCount++;
                    $process = $process->restart();
                    continue;
                }
                if (isset($out['message']) && $out['error'] === null) {
                    foreach ($out['message'] as $item) {
                        $result = new SearchResult();
                        $result
                            ->setFirstname($item['firstname'] ?? '')
                            ->setLastname($item['lastname'] ?? '')
                            ->setAge($item['age'] ?? '')
                            ->setAddress($item['location'] ?? '')
                            ->setLink($item['link'] ?? '')
                            ->setParserName($parser['name'])
                            ->setSearchRequest($res)
                            ->setCreatedAt(new DateTime());
                        $this->searchResultRepository->save($result);
                    }
                    $this->logger->info('Successful response from '. $parser['name']);
                    unset($process);
                    return;
                }

            } else {
                $out = $process->getErrorOutput();
                $this->logger->error('Error in process. Try again', ['name' => $parser['name'], 'out' => $out]);

                if ($tryCount > 3) {
                    $this->logger->info('Try count exceed. Name: '. $parser['name']);
                    unset($process);
                    break;
                }

                $tryCount++;
                $process = $process->restart();
            }
        }
    }

    private function addNewProcess(SearchRequest $request, $parser): Process
    {
        $projectPath = $this->params->get('kernel.project_dir');
        $path = sprintf('%s/%s', $projectPath, $parser['path']);
        $process = new Process([
            'node',
            $path,
            $request->getFirstname(),
            $request->getLastname(),
            $request->getCity(),
            $request->getState() ?? ''
        ]);
        $process->setTimeout(self::TIMEOUT_8_MIN);

        $process->start();
        $this->logger->info('Start searching: ' . $parser['name']);

        return $process;
    }
}
