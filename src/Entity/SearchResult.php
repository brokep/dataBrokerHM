<?php

namespace App\Entity;

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
    private string $parserName;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $firstname;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $lastname;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $address;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $link;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private string $age;

    /**
     * @ORM\ManyToOne(targetEntity="SearchRequest", inversedBy="results")
     * @ORM\JoinColumn(name="search_request_id", referencedColumnName="id")
     */
    private SearchRequest $searchRequest;

    /**
     * @return string
     */
    public function getParserName(): string
    {
        return $this->parserName;
    }

    public function setParserName(string $parserName): self
    {
        $this->parserName = $parserName;

        return $this;
    }

    /**
     * @return string
     */
    public function getFirstname(): string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    /**
     * @return string
     */
    public function getLastname(): string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    /**
     * @return string
     */
    public function getAddress(): string
    {
        return $this->address;
    }

    public function setAddress(string $address): self
    {
        $this->address = $address;

        return $this;
    }

    /**
     * @return string
     */
    public function getAge(): string
    {
        return $this->age;
    }

    public function setAge(string $age): self
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

    /**
     * @return string
     */
    public function getLink(): string
    {
        return $this->link;
    }

    public function setLink(string $link): self
    {
        $this->link = $link;

        return $this;
    }
}