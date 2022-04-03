<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 */
class SearchRequest
{
    use EntityTrait;

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
    private string $city;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string|null $state;

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    private string $status;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="searchRequests")
     */
    private ArrayCollection|Collection $users;

    /**
     * @ORM\OneToMany(targetEntity="SearchResult", mappedBy="searchRequest")
     */
    private ArrayCollection|Collection $results;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->results = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getFirstname(): string
    {
        return $this->firstname;
    }

    /**
     * @param string $firstname
     */
    public function setFirstname(string $firstname): void
    {
        $this->firstname = $firstname;
    }

    /**
     * @return string
     */
    public function getLastname(): string
    {
        return $this->lastname;
    }

    /**
     * @param string $lastname
     */
    public function setLastname(string $lastname): void
    {
        $this->lastname = $lastname;
    }

    /**
     * @return string
     */
    public function getCity(): string
    {
        return $this->city;
    }

    /**
     * @param string $city
     */
    public function setCity(string $city): void
    {
        $this->city = $city;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    /**
     * @param string $state
     */
    public function setState(string $state): void
    {
        $this->state = $state;
    }

    /**
     * @return string
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * @param string $status
     */
    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    /**
     * @param ArrayCollection $users
     */
    public function setUsers(ArrayCollection $users): void
    {
        $this->users = $users;
    }

    public function getResults(): Collection
    {
        return $this->results;
    }

    /**
     * @param ArrayCollection $results
     */
    public function setResults(ArrayCollection $results): void
    {
        $this->results = $results;
    }
}