<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Utils\Validator;

class ValidatorTest extends TestCase
{
    public function testValidateBooking()
    {
        $validData = [
            'name' => 'John Doe',
            'phone' => '1234567890',
            'registration' => 'ABC123',
            'service' => 'Oil Change',
            'email' => 'john@example.com'
        ];
        $result = Validator::validateBooking($validData);
        $this->assertIsArray($result);
        $this->assertArrayHasKey('valid', $result);
        if (isset($result['valid'])) {
            $this->assertTrue($result['valid'], 'Validation should pass. Errors: ' . json_encode($result['errors'] ?? []));
        } else {
            $this->fail('Validator should return array with "valid" key. Got: ' . json_encode($result));
        }

        $invalidData = [
            'name' => '',
            'phone' => '123',
            'registration' => '',
            'service' => ''
        ];
        $result = Validator::validateBooking($invalidData);
        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('errors', $result);
    }

    public function testValidateContact()
    {
        $validData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Test Subject',
            'message' => 'This is a test message that is long enough'
        ];
        $result = Validator::validateContact($validData);
        $this->assertTrue($result['valid']);

        $invalidData = [
            'name' => '',
            'email' => 'invalid-email',
            'subject' => '',
            'message' => 'short'
        ];
        $result = Validator::validateContact($invalidData);
        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('errors', $result);
    }

    public function testValidateBlogPost()
    {
        $validData = [
            'title' => 'Test Blog Post Title',
            'content' => str_repeat('This is test content. ', 20),
            'category' => 'Maintenance',
            'status' => 'published'
        ];
        $result = Validator::validateBlogPost($validData);
        $this->assertTrue($result['valid']);

        $invalidData = [
            'title' => 'Hi',
            'content' => 'Short',
            'status' => 'invalid'
        ];
        $result = Validator::validateBlogPost($invalidData);
        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('errors', $result);
    }
}
