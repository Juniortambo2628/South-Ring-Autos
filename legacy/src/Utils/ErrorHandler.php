<?php

namespace SouthRingAutos\Utils;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;

/**
 * Error Handler
 * Centralized error handling and logging
 */
class ErrorHandler
{
    private static $logger = null;

    /**
     * Initialize error handler
     */
    public static function init()
    {
        if (self::$logger === null) {
            self::$logger = new Logger('errors');
            self::$logger->pushHandler(new StreamHandler(ERROR_LOG_FILE, Logger::ERROR));
        }

        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    /**
     * Handle PHP errors
     */
    public static function handleError($level, $message, $file, $line)
    {
        if (! (error_reporting() & $level)) {
            return false;
        }

        $error = [
            'level' => self::getErrorLevelName($level),
            'message' => $message,
            'file' => $file,
            'line' => $line,
        ];

        self::$logger->error($message, $error);

        if (DEBUG_MODE) {
            echo "<div style='background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px;'>";
            echo "<strong>Error ({$error['level']}):</strong> {$message}<br>";
            echo "<strong>File:</strong> {$file} on line {$line}";
            echo "</div>";
        }

        return true;
    }

    /**
     * Handle exceptions
     */
    public static function handleException($exception)
    {
        $error = [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ];

        self::$logger->error('Uncaught exception', $error);

        if (DEBUG_MODE) {
            echo "<div style='background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px;'>";
            echo "<strong>Exception:</strong> {$exception->getMessage()}<br>";
            echo "<strong>File:</strong> {$exception->getFile()} on line {$exception->getLine()}<br>";
            echo "<pre>{$exception->getTraceAsString()}</pre>";
            echo "</div>";
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'An error occurred. Please try again later.',
            ]);
        }
    }

    /**
     * Handle fatal errors
     */
    public static function handleShutdown()
    {
        $error = error_get_last();
        if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            self::handleError($error['type'], $error['message'], $error['file'], $error['line']);
        }
    }

    /**
     * Get error level name
     */
    private static function getErrorLevelName($level)
    {
        $levels = [
            E_ERROR => 'ERROR',
            E_WARNING => 'WARNING',
            E_PARSE => 'PARSE',
            E_NOTICE => 'NOTICE',
            E_CORE_ERROR => 'CORE_ERROR',
            E_CORE_WARNING => 'CORE_WARNING',
            E_COMPILE_ERROR => 'COMPILE_ERROR',
            E_COMPILE_WARNING => 'COMPILE_WARNING',
            E_USER_ERROR => 'USER_ERROR',
            E_USER_WARNING => 'USER_WARNING',
            E_USER_NOTICE => 'USER_NOTICE',
            E_STRICT => 'STRICT',
            E_RECOVERABLE_ERROR => 'RECOVERABLE_ERROR',
            E_DEPRECATED => 'DEPRECATED',
            E_USER_DEPRECATED => 'USER_DEPRECATED',
        ];

        return $levels[$level] ?? 'UNKNOWN';
    }
}
