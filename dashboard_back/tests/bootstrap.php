<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

// Ensure local App\ and Tests\ namespaces resolve directly from dashboard_back
spl_autoload_register(function ($class) {
    if (str_starts_with($class, 'App\\')) {
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
    if (str_starts_with($class, 'Tests\\')) {
        $file = dirname(__DIR__) . '/tests/' . str_replace('\\', '/', substr($class, 6)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
}, true, true);
