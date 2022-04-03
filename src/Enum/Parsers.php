<?php

namespace App\Enum;

class Parsers
{
    public const FLORIDA = 'florida';
    public const MY_LIFE = 'mylife';
    public const SPOKEO = 'spokeo';

    public const PARSERS = [
        self::FLORIDA => [
            'name' => 'FloridaResidentsDirectory.com',
            'path' => 'src/Parser/florida.js',
            'path_to_deleter' => '',
        ],
//        self::MY_LIFE => [
//            'name' => 'test',
//            'path' => 'src/Parser/test.js',
//            'path_to_deleter' => '',
//        ],
//        self::SPOKEO => [
//            'name' => 'test2',
//            'path' => 'src/Parser/test.js',
//            'path_to_deleter' => '',
//        ],
    ];
}