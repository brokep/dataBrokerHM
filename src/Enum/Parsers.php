<?php

namespace App\Enum;

class Parsers
{
    public const SITE_411 = '411';
    public const ABCHECK = 'abcheck';
    public const CLUSTRMAPS = 'clustrmaps';
    public const CYBER_B_C = 'cyber';
    public const FAST_PEOPLE = 'fast_people';
    public const FLORIDA = 'florida';
    public const MY_LIFE = 'mylife';
    public const PEEKYOU = 'peekyou';
    public const PEOPLE_FRIENDS = 'people_friends';
    public const SPOKEO = 'spokeo';
    public const TRUEPEOPLE_SEARCH = 'true_people_search';
    public const USA_TRACE = 'usa_trace';
    public const US_SEARCH = 'us_search';
    public const VOTER_RECORDS = 'voter_records';
    public const WHITE_PAGES = 'white_pages';

    public const TEST_PARSER = [
        '1' => [
            'name' => 'FloridaResidentsDirectory1.com',
            'path' => 'src/Parser/floridatest.js',
            'path_to_deleter' => '',
        ],
        '2' => [
            'name' => 'FloridaResidentsDirectory2.com',
            'path' => 'src/Parser/floridatest.js',
            'path_to_deleter' => '',
        ],
        '3' => [
            'name' => 'FloridaResidentsDirectory3.com',
            'path' => 'src/Parser/floridatest.js',
            'path_to_deleter' => '',
        ],
    ];

    public const PARSERS = [
        self::SITE_411 => [
            'name' => '411.com',
            'path' => 'src/Parser/411.js',
            'path_to_deleter' => '',
        ],
        self::ABCHECK => [
            'name' => 'abcheck.com',
            'path' => 'src/Parser/abcheck.js',
            'path_to_deleter' => '',
        ],
        self::CLUSTRMAPS => [
            'name' => 'clustrmaps.com',
            'path' => 'src/Parser/clustrmaps.js',
            'path_to_deleter' => '',
        ],
        self::CYBER_B_C => [
            'name' => 'cyberBackgroundChecks.com',
            'path' => 'src/Parser/cyberbackgroundchecks.js',
            'path_to_deleter' => '',
        ],
        self::FAST_PEOPLE => [
            'name' => 'fastPeopleSearch.com',
            'path' => 'src/Parser/fastpeople.js',
            'path_to_deleter' => '',
        ],
        self::FLORIDA => [
            'name' => 'FloridaResidentsDirectory.com',
            'path' => 'src/Parser/florida.js',
            'path_to_deleter' => '',
        ],
        self::MY_LIFE => [
            'name' => 'mylife.com',
            'path' => 'src/Parser/mylife.js',
            'path_to_deleter' => '',
        ],
        self::PEEKYOU => [
            'name' => 'peekyou.com',
            'path' => 'src/Parser/peekyou.js',
            'path_to_deleter' => '',
        ],
        self::PEOPLE_FRIENDS => [
            'name' => 'peopleFriends.com',
            'path' => 'src/Parser/peoplefinders.js',
            'path_to_deleter' => '',
        ],
        self::SPOKEO => [
            'name' => 'spokeo.com',
            'path' => 'src/Parser/spokeo.js',
            'path_to_deleter' => '',
        ],
//        self::TRUEPEOPLE_SEARCH => [
//            'name' => 'truePeopleSearch.com',
//            'path' => 'src/Parser/truepeoplesearch.js',
//            'path_to_deleter' => '',
//        ],
        self::USA_TRACE => [
            'name' => 'usaTrace.com',
            'path' => 'src/Parser/usatrace.js',
            'path_to_deleter' => '',
        ],
        self::US_SEARCH => [
            'name' => 'usSearch.com',
            'path' => 'src/Parser/ussearch.js',
            'path_to_deleter' => '',
        ],
        self::VOTER_RECORDS => [
            'name' => 'voterRecords.com',
            'path' => 'src/Parser/voterrecords.js',
            'path_to_deleter' => '',
        ],
        self::WHITE_PAGES => [
            'name' => 'whitePages',
            'path' => 'src/Parser/whitepages.js',
            'path_to_deleter' => '',
        ]
    ];
}
