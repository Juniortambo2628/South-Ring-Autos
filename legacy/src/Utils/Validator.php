<?php

namespace SouthRingAutos\Utils;

use Respect\Validation\Exceptions\NestedValidationException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator as v;

/**
 * Input Validation Utility
 * Centralized validation using Respect\Validation
 */
class Validator
{
    /**
     * Validate booking data
     */
    public static function validateBooking($data)
    {
        $validator = v::key('name', v::stringType()->notEmpty()->length(2, 100))
            ->key('phone', v::stringType()->notEmpty()->length(10, 20))
            ->key('registration', v::stringType()->notEmpty()->length(3, 50))
            ->key('service', v::stringType()->notEmpty());

        // Add optional fields only if they exist in the data
        if (array_key_exists('email', $data) && ! empty($data['email'])) {
            $validator = $validator->key('email', v::email());
        }
        if (array_key_exists('date', $data) && ! empty($data['date'])) {
            $validator = $validator->key('date', v::date());
        }
        if (array_key_exists('message', $data) && ! empty($data['message'])) {
            $validator = $validator->key('message', v::stringType());
        }

        try {
            $validator->assert($data);

            return ['valid' => true];
        } catch (ValidationException $e) {
            // Use getMessages() if it's a NestedValidationException, otherwise use getMessage()
            if ($e instanceof NestedValidationException) {
                $errors = $e->getMessages();
            } else {
                // For single validation exceptions, use the exception message
                $errors = [$e->getMessage()];
            }

            return [
                'valid' => false,
                'errors' => $errors,
            ];
        }
    }

    /**
     * Validate contact form data
     */
    public static function validateContact($data)
    {
        $validator = v::key('name', v::stringType()->notEmpty())
            ->key('email', v::email()->notEmpty())
            ->key('subject', v::stringType()->notEmpty())
            ->key('message', v::stringType()->notEmpty()->length(10));

        // Add optional phone if present
        if (array_key_exists('phone', $data) && ! empty($data['phone'])) {
            $validator = $validator->key('phone', v::stringType());
        }

        try {
            $validator->assert($data);

            return ['valid' => true];
        } catch (ValidationException $e) {
            // Use getMessages() if it's a NestedValidationException, otherwise use getMessage()
            if ($e instanceof NestedValidationException) {
                $errors = $e->getMessages();
            } else {
                // For single validation exceptions, use the exception message
                $errors = [$e->getMessage()];
            }

            return [
                'valid' => false,
                'errors' => $errors,
            ];
        }
    }

    /**
     * Validate blog post data
     */
    public static function validateBlogPost($data)
    {
        $validator = v::key('title', v::stringType()->notEmpty()->length(5, 255))
            ->key('content', v::stringType()->notEmpty()->length(50));

        // Add optional fields if present
        if (array_key_exists('category', $data) && ! empty($data['category'])) {
            $validator = $validator->key('category', v::stringType());
        }
        if (array_key_exists('status', $data) && ! empty($data['status'])) {
            $validator = $validator->key('status', v::in(['published', 'draft']));
        }
        if (array_key_exists('image', $data) && ! empty($data['image'])) {
            $validator = $validator->key('image', v::stringType());
        }

        try {
            $validator->assert($data);

            return ['valid' => true];
        } catch (ValidationException $e) {
            // Use getMessages() if it's a NestedValidationException, otherwise use getMessage()
            if ($e instanceof NestedValidationException) {
                $errors = $e->getMessages();
            } else {
                // For single validation exceptions, use the exception message
                $errors = [$e->getMessage()];
            }

            return [
                'valid' => false,
                'errors' => $errors,
            ];
        }
    }
}
