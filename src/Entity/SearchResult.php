<?php

namespace App\Entity;

use DateTime;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 */
class SearchResult
{
    use EntityTrait;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $parserName;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $fullname;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $address;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $link;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $age;

    /**
     * @ORM\ManyToOne(targetEntity="SearchRequest", inversedBy="results")
     * @ORM\JoinColumn(name="search_request_id", referencedColumnName="id")
     */
    private SearchRequest $searchRequest;

    public function getParserName(): ?string
    {
        return $this->parserName;
    }

    public function setParserName(?string $parserName): self
    {
        $this->parserName = $parserName;

        return $this;
    }

    public function getFullname(): ?string
    {
        return $this->fullname;
    }

    public function setFullname(?string $name): self
    {
        $this->fullname = $name;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): self
    {
        $this->address = $address;

        return $this;
    }

    public function getAge(): ?string
    {
        return $this->age;
    }

    public function setAge(?string $age): self
    {
        $this->age = $age;

        return $this;
    }

    /**
     * @return SearchRequest
     */
    public function getSearchRequest(): SearchRequest
    {
        return $this->searchRequest;
    }

    public function setSearchRequest(SearchRequest $searchRequest): self
    {
        $this->searchRequest = $searchRequest;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function setLink(?string $link): self
    {
        $this->link = $link;

        return $this;
    }

    public static function fromParser(string $parserName, array $data, SearchRequest $result): self
    {
        $s = new self();

        $s
            ->setFullname((string) ($data['name'] ?? ''))
            ->setAge((string) ($data['age'] ?? ''))
            ->setAddress((string) ($data['location'] ?? ''))
            ->setLink((string) ($data['link'] ?? ''))
            ->setParserName($parserName)
            ->setSearchRequest($result)
            ->setCreatedAt(new DateTime());

        return $s;
    }

    public static function forError(string $parserName, SearchRequest $result): self
    {
        $s = new self();

        $s
            ->setFullname('No data or error. Please check manually')
            ->setParserName($parserName)
            ->setSearchRequest($result)
            ->setCreatedAt(new DateTime());

        return $s;
    }
}
