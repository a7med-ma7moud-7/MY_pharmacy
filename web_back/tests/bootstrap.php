<?php

require __DIR__ . '/../vendor/autoload.php';

// Custom autoloader to ensure Tests\ namespace resolves locally within web_back/tests
spl_autoload_register(function ($class) {
    if (str_starts_with($class, 'Tests\\')) {
        $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, 6)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
}, true, true);
