<?php
return [
    'printer_name' => env('PRINTER_NAME', 'iWare 58mm'),
    'codepage'     => (int) env('PRINTER_CODEPAGE', 0),
    'width'        => (int) env('RECEIPT_WIDTH', 32),
];

// 58mm → 32 karakter → 'width' => 32
// 80mm → 48 karakter → 'width' => 48