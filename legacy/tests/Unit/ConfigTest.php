<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Config\Config;

class ConfigTest extends TestCase
{
    public function testConfigInit()
    {
        $config = Config::init();
        $this->assertIsArray($config);
    }

    public function testConfigGet()
    {
        $value = Config::get('app.name');
        $this->assertEquals('South Ring Autos', $value);
    }

    public function testConfigHas()
    {
        $this->assertTrue(Config::has('app.name'));
        $this->assertFalse(Config::has('app.nonexistent'));
    }

    public function testConfigDefault()
    {
        $value = Config::get('app.nonexistent', 'default');
        $this->assertEquals('default', $value);
    }
}


