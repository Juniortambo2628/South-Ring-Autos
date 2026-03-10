<?php
/**
 * Logger Service
 * Wrapper for Monolog for application logging
 */

namespace SouthRingAutos\Utils;

use Monolog\Logger as MonologLogger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\LineFormatter;

class Logger
{
    private static $instance = null;
    private $logger;

    private function __construct()
    {
        $this->logger = new MonologLogger('SouthRingAutos');
        $this->configure();
    }

    /**
     * Get singleton instance
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Configure logger handlers
     */
    private function configure()
    {
        $logPath = defined('LOG_PATH') ? LOG_PATH : __DIR__ . '/../../storage/logs';
        
        if (!is_dir($logPath)) {
            mkdir($logPath, 0755, true);
        }

        // Main application log (rotates daily)
        $mainHandler = new RotatingFileHandler(
            $logPath . '/app.log',
            30, // Keep 30 days
            MonologLogger::DEBUG
        );
        $mainHandler->setFormatter(new LineFormatter(
            "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n",
            'Y-m-d H:i:s'
        ));
        $this->logger->pushHandler($mainHandler);

        // Error log (separate file)
        $errorHandler = new StreamHandler(
            $logPath . '/error.log',
            MonologLogger::ERROR
        );
        $errorHandler->setFormatter(new LineFormatter(
            "[%datetime%] %level_name%: %message% %context% %extra%\n",
            'Y-m-d H:i:s'
        ));
        $this->logger->pushHandler($errorHandler);
    }

    /**
     * Log debug message
     */
    public function debug($message, array $context = [])
    {
        $this->logger->debug($message, $context);
    }

    /**
     * Log info message
     */
    public function info($message, array $context = [])
    {
        $this->logger->info($message, $context);
    }

    /**
     * Log warning message
     */
    public function warning($message, array $context = [])
    {
        $this->logger->warning($message, $context);
    }

    /**
     * Log error message
     */
    public function error($message, array $context = [])
    {
        $this->logger->error($message, $context);
    }

    /**
     * Log critical message
     */
    public function critical($message, array $context = [])
    {
        $this->logger->critical($message, $context);
    }

    /**
     * Static convenience methods
     */
    public static function logDebug($message, array $context = [])
    {
        self::getInstance()->debug($message, $context);
    }

    public static function logInfo($message, array $context = [])
    {
        self::getInstance()->info($message, $context);
    }

    public static function logWarning($message, array $context = [])
    {
        self::getInstance()->warning($message, $context);
    }

    public static function logError($message, array $context = [])
    {
        self::getInstance()->error($message, $context);
    }

    public static function logCritical($message, array $context = [])
    {
        self::getInstance()->critical($message, $context);
    }
}

