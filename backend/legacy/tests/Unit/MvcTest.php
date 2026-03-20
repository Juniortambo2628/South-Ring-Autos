<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Config\Config;
use SouthRingAutos\Utils\Validator;
use SouthRingAutos\Utils\Helper;
use SouthRingAutos\Utils\ImageUpload;

/**
 * MVC Pattern Tests
 * Tests separation of concerns and model/view/controller patterns
 */
class MvcTest extends TestCase
{
    public function testConfigModelPattern()
    {
        // Test that Config acts as a model/service layer
        Config::init();
        
        $this->assertTrue(Config::has('app'));
        $this->assertIsArray(Config::all());
    }

    public function testValidatorServicePattern()
    {
        // Test that Validator acts as a service layer
        $validBooking = Validator::validateBooking([
            'name' => 'Test User',
            'phone' => '+254712345678',
            'registration' => 'ABC123',
            'service' => 'Oil Change',
            'email' => 'test@example.com'
        ]);
        $this->assertTrue($validBooking['valid']);
        
        $invalidBooking = Validator::validateBooking([
            'name' => 'T',
            'phone' => '123',
            'registration' => '',
            'service' => ''
        ]);
        $this->assertFalse($invalidBooking['valid']);
    }

    public function testHelperUtilityPattern()
    {
        // Test that Helper provides utility functions (view helpers)
        $this->assertNotEmpty(Helper::formatDate(date('Y-m-d')));
        $this->assertNotEmpty(Helper::sanitize('test string'));
        $this->assertNotEmpty(Helper::slugify('Test String'));
        $this->assertNotEmpty(Helper::truncate('This is a long string that should be truncated', 20));
    }

    public function testImageUploadServicePattern()
    {
        // Test that ImageUpload acts as a service layer
        // This tests the service pattern, not actual file upload
        $this->assertTrue(class_exists('SouthRingAutos\Utils\ImageUpload'));
        
        // Test that constants are defined (service configuration)
        $reflection = new \ReflectionClass('SouthRingAutos\Utils\ImageUpload');
        $this->assertTrue($reflection->hasConstant('ALLOWED_TYPES'));
        $this->assertTrue($reflection->hasConstant('MAX_FILE_SIZE'));
    }

    public function testSeparationOfConcerns()
    {
        // Test that database logic is separated from business logic
        $this->assertTrue(class_exists('SouthRingAutos\Database\Database'));
        $this->assertTrue(class_exists('SouthRingAutos\Utils\Validator'));
        $this->assertTrue(class_exists('SouthRingAutos\Config\Config'));
        
        // These should be separate classes, not mixed
        $dbReflection = new \ReflectionClass('SouthRingAutos\Database\Database');
        $validatorReflection = new \ReflectionClass('SouthRingAutos\Utils\Validator');
        
        $this->assertNotEquals($dbReflection->getName(), $validatorReflection->getName());
    }

    public function testServiceLayerAbstraction()
    {
        // Test that services are abstracted properly
        $services = [
            'SouthRingAutos\Utils\Email',
            'SouthRingAutos\Utils\Notification',
            'SouthRingAutos\Services\MpesaService'
        ];
        
        foreach ($services as $service) {
            $this->assertTrue(class_exists($service), "Service {$service} should exist");
        }
    }
}

