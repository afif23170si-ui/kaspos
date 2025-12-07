<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\Menu;
use App\Models\User;
use App\Models\Setting;
use Mike42\Escpos\Printer;
use App\Models\BankAccount;
use App\Models\Transaction;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Models\DiscountPackage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\TransactionKitchen;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Mike42\Escpos\PrintConnectors\CupsPrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

class TransactionController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:transactions-data', only: ['index']),
            new Middleware('permission:transactions-payment', only: ['payment']),
            new Middleware('permission:transactions-receipt', only: ['receipt']),
            new Middleware('permission:transactions-invoice', only: ['invoice']),
        ];
    }

    public function index(Request $request)
    {
        // request page data
        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        // get all user with cashier role
        $cashiers = User::role('cashier')->orderBy('name')->get();

        // get all platforms
        $platforms = Setting::where('code', 'OLS')->orderBy('name')->get();

        // get all transaction
        $transactions = Transaction::query()
            ->with('transaction_details', 'cashier_shift', 'cashier_shift.user', 'customer')
            ->withSum('transaction_payments as payments_total', 'amount')
            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('invoice', 'like', '%' . $request->search . '%')
                        ->orWhere('shipping_ref', 'like', '%' . $request->search . '%')
                        ->orWhere('notes_noref', 'like', '%' . $request->search . '%')
                        ->orWhereHas('customer', function ($q) use ($request) {
                            $q->where('name', 'like', '%' . $request->search . '%');
                        });
                });
            })

            // Filter status pembayaran
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })

            // Filter tanggal transaksi (range)
            ->when($request->date_from, function ($query) use ($request) {
                $query->whereDate('transaction_date', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($query) use ($request) {
                $query->whereDate('transaction_date', '<=', $request->date_to);
            })

            // Filter platform transaksi
            ->when($request->platform && $request->platform !== 'all', function ($query) use ($request) {
                $query->where('platform', $request->platform);
            })

            // Filter status pengiriman
            ->when($request->shipping && $request->shipping !== 'all', function ($query) use ($request) {
                $query->where('shipping_status', $request->shipping);
            })

            // Filter kasir transaksi
            ->when($request->cashier && $request->cashier !== 'all', function ($query) use ($request) {
                $query->whereHas('cashier_shift.user', function ($q) use ($request) {
                    $q->where('id', $request->cashier);
                });
            })

            ->orderBy('updated_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $currentPage)
            ->withQueryString();

        $transactions->getCollection()->transform(function ($transaction) {
            $grandTotal = (int) $transaction->getRawOriginal('grand_total');
            $paidBase   = (int) $transaction->getRawOriginal('pay');
            $paidFromPayments = (int) ($transaction->payments_total ?? 0);

            $paidTotal = $paidBase + $paidFromPayments;
            $remaining = max($grandTotal - $paidTotal, 0);

            $transaction->transaction_date   = \Carbon\Carbon::parse($transaction->transaction_date)->format('d/m/Y');
            $transaction->remaining_payment  = $remaining;
            $transaction->remaining          = number_format($remaining, 0);
            $transaction->pay                = number_format($paidTotal, 0);
            $transaction->grand_total        = number_format($grandTotal, 0);

            return $transaction;
        });

        // get all bank accounts
        $banks = BankAccount::orderBy('bank_name')->get();

        return inertia('apps/transactions/index', [
            'platforms' => $platforms,
            'cashiers' => $cashiers,
            'banks' => $banks,
            'transactions' => $transactions,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    public function invoice(Transaction $transaction)
    {
        $codes = ['PRNT', 'NAME', 'ADDRESS', 'PHONE', 'LOGO'];
        $settings = Setting::query()
            ->where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $transaction->load([
            'customer',
            'waiter',
            'table',
            'cashier_shift.user',
            'bank_account',
            'transaction_taxs',
            'transaction_payments.bank_account',
            'transaction_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option',
                    ],
                    Menu::class => [],
                    DiscountPackage::class => ['discount_package_items'],
                ]);
            },
        ]);

        $logoValue = $settings['LOGO'] ?? null;

        $logoAbsPath = null;
        if ($logoValue) {
            $maybePath = parse_url($logoValue, PHP_URL_PATH) ?: $logoValue;
            $maybePath = ltrim($maybePath, '/');
            $absPath   = public_path($maybePath);
            if (is_file($absPath)) {
                $logoAbsPath = $absPath;
            }
        }

        $logoUrl = $logoValue
            ? (Str::startsWith($logoValue, ['http://', 'https://']) ? $logoValue : asset($logoValue))
            : asset('NoImage.png');

        $logoFileForEmbedding = $logoAbsPath ?: public_path('NoImage.png');
        $logoDataUri = null;
        if (is_file($logoFileForEmbedding)) {
            $mime = mime_content_type($logoFileForEmbedding) ?: 'image/png';
            $logoData    = file_get_contents($logoFileForEmbedding);
            $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode($logoData);
        }

        $store = [
            'name'          => $settings['NAME']    ?? 'Wioos',
            'addr'          => $settings['ADDRESS'] ?? 'Jakarta',
            'phone'         => $settings['PHONE']   ?? '0822102',
            'logo_url'      => $logoUrl,
            'logo_path'     => $logoAbsPath ?: public_path('NoImage.png'),
            'logo_data_uri' => $logoDataUri,
        ];

        $statusPayment = [
            'paid'    => 'Lunas',
            'partial' => 'Belum Lunas',
            'pending' => 'Belum Dibayar',
        ];
        $statusShipping = [
            'pending'   => 'Menunggu',
            'shipped'   => 'Dikirim',
            'delivered' => 'Terkirim',
            'cancelled' => 'Dibatalkan',
        ];
        $statusTransaction = [
            'dine_in'  => 'Makan Ditempat',
            'takeaway' => 'Takeaway',
            'platform' => 'Platform',
        ];

        $banks = BankAccount::query()->orderBy('bank_name')->get();

        return Pdf::setOptions([
            'isRemoteEnabled' => true,
        ])
        ->loadView('pdf.invoice-transaction', [
            'trx'               => $transaction,
            'statusPayment'     => $statusPayment,
            'statusShipping'    => $statusShipping,
            'statusTransaction' => $statusTransaction,
            'store'             => $store,
            'banks'             => $banks,
        ])
        ->stream('Invoice_' . $transaction->invoice . '.pdf');
    }

    public function receipt(Transaction $transaction)
    {
        $transaction->load([
            'transaction_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option',
                    ],
                    Menu::class => ['category'],
                    DiscountPackage::class => [
                        'discount_package_items.items' => function ($morphTo) {
                            $morphTo->morphWith([
                                ProductVariant::class => [
                                    'product',
                                    'unit',
                                    'product_variant_values',
                                    'product_variant_values.variant_value',
                                    'product_variant_values.variant_value.variant_option',
                                ],
                            ]);
                        },
                    ],
                ]);
            },
            'transaction_taxs',
            'table',
            'cashier_shift.user',
            'customer',
        ]);

        $codes = ['PRNT', 'NAME', 'ADDRESS', 'PHONE'];
        $settings = Setting::where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $printerName = $settings['PRNT'] ?? null;
        $W = (int) (config('printer.width') ?? 42);

        $idr   = fn(int $n) => 'Rp ' . number_format($n, 0, ',', '.');
        $sep   = fn() => str_repeat('-', $W) . "\n";
        $wrap  = fn(string $t) => wordwrap($t, $W, "\n", true) . "\n";
        $cols2 = function (string $left, string $right) use ($W) {
            $left  = preg_replace('/\s+/', ' ', $left);
            $right = preg_replace('/\s+/', ' ', $right);
            $rLen  = mb_strlen($right);
            $lMax  = max(0, $W - $rLen);
            $lTrim = mb_substr($left, 0, $lMax);
            return str_pad($lTrim, $lMax, ' ') . $right . "\n";
        };
        $variantLabel = function (ProductVariant $pv) {
            $parts = $pv->product_variant_values
                ->map(fn($v) => ($v->variant_value->variant_option->name ?? '') . ': ' . ($v->variant_value->name ?? ''))
                ->filter()
                ->values();
            return $parts->isNotEmpty() ? ' [' . $parts->implode(', ') . ']' : '';
        };

        $lines = $transaction->transaction_details->map(function ($d) use ($variantLabel) {
            if ($d->items_type === ProductVariant::class) {
                $pv   = $d->items;
                $name = ($pv->product->name ?? 'Variant') . $variantLabel($pv);
            } elseif ($d->items_type === Menu::class) {
                $name = $d->items->name ?? 'Menu';
            } elseif ($d->items_type === DiscountPackage::class) {
                $name = $d->items->name ?? 'Paket';
            } else {
                $name = class_basename($d->items_type);
            }

            $qty    = (int) $d->quantity;
            $price  = (int) $d->price;
            // Hitung diskon per item
            if ($d->discount_type === 'percentage') {
                $discountPerItem = (int) floor($price * ((int) $d->discount) / 100);
            } else {
                $discountPerItem = (int) $d->discount;
            }

            // Harga setelah diskon per item
            $finalPrice = max(0, $price - $discountPerItem);

            // Total keseluruhan item
            $totalAmount = $finalPrice * $qty;

            return [
                'name'   => $name,
                'qty'    => $qty,
                'price'  => $finalPrice,
                'amount' => $totalAmount,
            ];
        })->values()->all();

        $subtotal = array_reduce($lines, fn($c, $i) => $c + $i['amount'], 0);
        $discount = (int) ($transaction->discount ?? 0);

        $taxes = collect($transaction->transaction_taxs ?? [])
            ->map(fn($t) => ['label' => $t->name, 'value' => (int) $t->value])
            ->values()
            ->all();

        $total  = (int) $transaction->grand_total;
        $paid   = (int) $transaction->pay;
        $change = (int) $transaction->change;

        $store = [
            'name'  => $settings['NAME'] ?? 'TOKO',
            'addr'  => $settings['ADDRESS'] ?? '',
            'phone' => $settings['PHONE'] ?? '',
        ];

        $orderType    = (string) $transaction->transaction_type;
        $tableNo      = $transaction->table->number ?? null;
        $customerName = $transaction->customer->name ?? 'Umum';

        switch ($orderType) {
            case 'dine_in':
                $statusOrder = 'Makan ditempat';
                break;
            case 'platform':
                $statusOrder = ucfirst((string) $transaction->platform);
                break;
            case 'takeaway':
                $statusOrder = 'Takeaway';
                break;
            default:
                $statusOrder = ucfirst($orderType);
        }

        $driver = env('PRINT_DRIVER');
        $queue  = ($printerName ?: env('PRINT_NAME'));
        $host   = env('PRINT_HOST');
        $port   = (int) env('PRINT_PORT', 9100);

        if (!$driver) {
            $family = PHP_OS_FAMILY;
            $driver = ($family === 'Windows') ? 'windows' : 'cups';
        }

        $p = null;
        try {
            switch ($driver) {
                case 'windows':
                    if (empty($queue)) {
                        throw new \RuntimeException('Printer name (PRNT/PRINT_NAME) kosong untuk WindowsPrintConnector');
                    }
                    $connector = new WindowsPrintConnector($queue);
                    break;

                case 'cups':
                    if (empty($queue)) {
                        throw new \RuntimeException('CUPS queue (PRNT/PRINT_NAME) kosong untuk CupsPrintConnector');
                    }
                    $connector = new CupsPrintConnector($queue);
                    break;

                case 'network':
                    if (empty($host)) {
                        throw new \RuntimeException('PRINT_HOST belum diisi untuk NetworkPrintConnector');
                    }
                    $connector = new NetworkPrintConnector($host, $port ?: 9100);
                    break;

                default:
                    throw new \RuntimeException("PRINT_DRIVER tidak dikenal: {$driver}");
            }

            $p = new Printer($connector);
            $p->initialize();

            $printKVP = function (Printer $printer, string $label, string $value) use ($W) {
                static $keyWidth = null;
                if ($keyWidth === null) {
                    $labels   = ['Invoice', 'Tanggal', 'Jenis', 'Pelanggan', 'Meja', 'Kasir'];
                    $keyWidth = max(array_map(fn($l) => mb_strlen($l), $labels));
                }
                $left  = str_pad($label, $keyWidth, ' ', STR_PAD_RIGHT) . ' : ';
                $right = (string) $value;

                $avail = $W - mb_strlen($left);
                $first = mb_substr($right, 0, $avail);
                $printer->text($left . $first . "\n");

                $rest = mb_substr($right, $avail);
                while ($rest !== '') {
                    $chunk = mb_substr($rest, 0, $avail);
                    $printer->text(str_repeat(' ', mb_strlen($left)) . $chunk . "\n");
                    $rest = mb_substr($rest, mb_strlen($chunk));
                }
            };

            $p->setJustification(Printer::JUSTIFY_CENTER);
            $p->setEmphasis(true);
            $p->text(($store['name'] ?: 'TOKO') . "\n");
            $p->setEmphasis(false);
            if (!empty($store['addr'])) {
                $p->text($store['addr'] . "\n");
            }
            if (!empty($store['phone'])) {
                $p->text('Telp: ' . $store['phone'] . "\n");
            }
            $p->text($sep());

            $p->setJustification(Printer::JUSTIFY_LEFT);
            $printKVP($p, 'Invoice', $transaction->invoice);
            $printKVP($p, 'Tanggal', now()->format('d/m/Y H:i'));
            $printKVP($p, 'Jenis',   (string) $statusOrder);
            if ($tableNo)      $printKVP($p, 'Meja',      (string) $tableNo);
            if ($customerName) $printKVP($p, 'Pelanggan', (string) $customerName);
            if ($transaction->cashier_shift && $transaction->cashier_shift->user) {
                $printKVP($p, 'Kasir', (string) $transaction->cashier_shift->user->name);
            }
            $p->text($sep());

            foreach ($lines as $it) {
                $p->text($wrap($it['name']));
                $p->text($cols2("{$it['qty']} x " . $idr($it['price']), $idr($it['amount'])));
            }

            $p->text($sep());
            $p->text($cols2('Subtotal', $idr($subtotal)));
            if ($discount) {
                $p->text($cols2('Diskon', '-' . $idr($discount)));
            }
            foreach ($taxes as $t) {
                $p->text($cols2($t['label'], $idr($t['value'])));
            }

            $p->setEmphasis(true);
            $p->text($cols2('TOTAL', $idr($total)));
            $p->setEmphasis(false);

            $p->text($sep());
            $labelBayar = 'Bayar ' . ($transaction->payment_method == 'cash' ? 'Cash' : 'Transfer');
            $p->text($cols2($labelBayar, $idr($paid)));
            $p->text($cols2('Kembali', $idr($change)));

            $p->feed(2);
            $p->setJustification(Printer::JUSTIFY_CENTER);
            $p->text("Terima kasih!\n");
            $p->feed(1);

            try {
                $p->cut(Printer::CUT_PARTIAL);
            } catch (\Throwable $e) {
            }

            return response()->json(['message' => 'Struk berhasil dicetak']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal mencetak: ' . $e->getMessage(),
                'hint'    => 'Pastikan PRINT_DRIVER & PRNT/PRINT_NAME benar. Di macOS gunakan CupsPrintConnector dengan queue CUPS; atau PRINT_DRIVER=network (9100).',
            ], 500);
        } finally {
            if (isset($p) && $p) {
                try {
                    $p->close();
                } catch (\Throwable $e) {
                }
            }
        }
    }

    public function payment(Transaction $transaction, Request $request)
    {
        DB::transaction(function () use ($transaction, $request) {
            $payments = $request->payments;
            $remaining_payment = $request->remaining_payment;

            foreach ($payments as $payment)
                $transaction->transaction_payments()->create([
                    'bank_account_id' => $payment['payment_account'],
                    'amount' => $payment['total_pay'],
                    'payment_method' => $payment['payment_method'],
                    'paid_at' => $payment['payment_date']
                ]);

            if ($remaining_payment == 0)
                $transaction->update(['status' => 'paid']);
        });

        return back();
    }

    public function destroy(Transaction $transaction)
    {
        TransactionKitchen::where('transaction_id', $transaction->id)->delete();

        $transaction->delete();

        return back();
    }
}
