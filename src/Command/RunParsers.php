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

    const TIMEOUT_15_MIN = 1000;
    const MAX_PROCESSES = 4;

    /** @var Process[] */
    private array $processes = [];
    private Generator $parsers;

    public function __construct(
        private ContainerBagInterface $params,
        private SearchRequestRepository $searchRequestRepository,
        private SearchResultRepository $searchResultRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $res = $this->searchRequestRepository->findBy(['status' => SearchRequestStatus::IN_PROGRESS]);
        if (count($res) > 0) {
            $this->logger->info('Job is running');
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
            $this->parsers = $this->getParsersIterator();

            $this->logger->info('Start process job ' . $res->getId());

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
        while (true) {
            $this->checkRunningProcesses($request);

            if (count($this->processes) < self::MAX_PROCESSES) {
                $this->addNewProcess($request);
            }

            if (count($this->processes) === 0) {
                $request->setStatus(SearchRequestStatus::DONE);
                $this->searchRequestRepository->save($request);
                return;
            }

            sleep(1);
        }
    }

    private function getParsersIterator(): Generator
    {
        foreach (Parsers::PARSERS as $parser) {
           yield $parser;
        }
    }

    private function checkRunningProcesses(SearchRequest $res)
    {
        foreach ($this->processes as $name => $process) {
            if ($process->isRunning()) {
                continue;
            }

            if ($process->isSuccessful()) {
                $out = json_decode($process->getOutput(), true);

                if ($out['error'] !== null) {
                    $this->logger->error("Error inside parser", [
                        'name' => $name,
                        'error' => $out['error'],
                    ]);
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
                            ->setParserName($name)
                            ->setSearchRequest($res)
                            ->setCreatedAt(new DateTime());
                        $this->searchResultRepository->save($result);
                    }
                }

            } else {
                $out = $process->getErrorOutput();
                $this->logger->error('Error in process', ['name' => $name, 'out' => $out]);
            }

            unset($this->processes[$name]);
        }
    }

    private function addNewProcess(SearchRequest $request)
    {
        $parser = $this->parsers->current();
        if ($parser === null) {
            return;
        }
        $this->parsers->next();
        $this->logger->info('Active processes: ' . count($this->processes));
        $this->logger->info('Start searching: ' . $parser['name']);

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
        $process->setTimeout(self::TIMEOUT_15_MIN);

        $process->start();
        $this->processes[$parser['name']] = $process;
    }
}