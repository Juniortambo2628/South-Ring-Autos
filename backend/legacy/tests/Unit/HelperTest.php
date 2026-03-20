<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Utils\Helper;

class HelperTest extends TestCase
{
    public function testSanitize()
    {
        $this->assertEquals('test', Helper::sanitize('  test  '));
        $this->assertEquals('&lt;script&gt;', Helper::sanitize('<script>'));
        $this->assertEquals('&quot;quote&quot;', Helper::sanitize('"quote"'));
    }

    public function testSlugify()
    {
        $this->assertEquals('hello-world', Helper::slugify('Hello World!'));
        $this->assertEquals('test-string', Helper::slugify('Test String'));
        $this->assertEquals('123-abc', Helper::slugify('123 ABC'));
    }

    public function testTruncate()
    {
        $longString = str_repeat('a', 150);
        $truncated = Helper::truncate($longString, 100);
        $this->assertLessThanOrEqual(103, strlen($truncated)); // 100 + '...'
        $this->assertStringEndsWith('...', $truncated);
        
        $shortString = 'Short string';
        $this->assertEquals($shortString, Helper::truncate($shortString, 100));
    }

    public function testFormatDate()
    {
        $date = '2024-01-15 10:30:00';
        $formatted = Helper::formatDate($date, 'Y-m-d');
        $this->assertEquals('2024-01-15', $formatted);
    }
}

