<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice Penjualan - {{ $trx->invoice }}</title>
    <style>
        @page { margin: 20mm 10mm 15mm 10mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 20px; }
        h1, h2, h3 { margin-bottom: 5px; color: #222; }
        .header, .info-grid, .section { margin-bottom: 18px; }
        .header-grid>div { float: left; vertical-align: top; margin-right: 16px; }
        .header-grid>div:last-child { margin-right: 0; }
        .header-grid::after, .row::after, .info-grid::after { content: ""; display: table; clear: both; }

        .store-logo { width: 80px; }
        .store-info { position: relative; top: -10px; width: calc(100% - 80px - 220px - 32px); }
        .invoice-info { position: relative; top: -20px; width: 220px; text-align: right; }
        .invoice-code { background: #f0f0f0; padding: 8px 12px; font-weight: bold; border-radius: 4px; display: inline-block; margin-top: 6px; min-width: 165px; }

        .section-title { border-bottom: 1px solid #ddd; margin-bottom: 8px; padding-bottom: 4px; font-weight: bold; font-size: 1em; }

        .col-6 { width: 48%; float: left; }
        .col-6 + .col-6 { margin-left: 4%; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 10.5px; text-align: left; }
        th { background: #f9f9f9; }
        td.right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; background: #f9f9f9; }

        .footer-print { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: right; padding: 2mm 10mm 0 10mm; box-sizing: border-box; border-top: 1px solid #ccc; }
    </style>
</head>
<body>
    {{-- Header --}}
    <div class="header header-grid">
        <div class="store-logo">
            <img src="{{ $store['logo_data_uri'] }}" alt="Logo" style="max-height:80px;">
        </div>
        <div class="store-info">
            <h2>{{ $store['name'] }}</h2>
            <div>{{ $store['addr'] }}</div>
            <div>{{ $store['phone'] }}</div>
        </div>
        <div class="invoice-info">
            <h1>Invoice Penjualan</h1>
            <div class="invoice-code">{{ $trx->invoice }}</div>
        </div>
    </div>

    {{-- Info kiri/kanan --}}
    <div class="info-grid">
        <div class="col-6">
            <div class="section-title">Informasi Pelanggan</div>
            <div><strong>Nama:</strong> {{ $trx->customer->name ?? 'Umum' }}</div>
            @if($trx->transaction_type === 'dine_in')
                <div><strong>Meja:</strong> {{ $trx->table->number ?? '-' }}</div>
                <div><strong>Pelayan:</strong> {{ $trx->waiter->name ?? '-' }}</div>
            @endif
            @if($trx->transaction_type === 'platform')
                <div><strong>Platform:</strong> {{ $trx->platform ?? '-' }}</div>
            @endif
            @if($trx->shipping_name || $trx->shipping_address)
                <div><strong>Pengirim/kurir:</strong> {{ $trx->shipping_name ?? '-' }}</div>
                <div><strong>Alamat:</strong> {{ $trx->shipping_address ?? '-' }}</div>
                <div><strong>No. Resi:</strong> {{ $trx->shipping_ref ?? '-' }}</div>
                <div><strong>Status Kirim:</strong>
                    {{ $statusShipping[$trx->shipping_status] ?? ucfirst($trx->shipping_status ?? '-') }}
                </div>
            @endif
        </div>
        <div class="col-6">
            <div class="section-title">Detail Transaksi</div>
            <div><strong>Tipe:</strong> {{ $statusTransaction[$trx->transaction_type] }}</div>
            <div><strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($trx->created_at)->format('d/m/Y H:i') }}</div>
            <div><strong>Status Pembayaran:</strong>
                {{ $statusPayment[$trx->status] ?? ucfirst($trx->status) }}
            </div>
            @if($trx->notes_noref)
                <div><strong>No. Referensi:</strong> {{ $trx->notes_noref }}</div>
            @endif
            @if($trx->notes_transaction_source)
                <div><strong>Sumber:</strong> {{ $trx->notes_transaction_source }}</div>
            @endif
            <div><strong>Kasir:</strong> {{ $trx->cashier_shift->user->name }}</div>
        </div>
    </div>
    @php
        $rows = [];
        foreach ($trx->transaction_details as $index => $d) {
            $qty = (float)$d->quantity;
            $price = (float)$d->price;
            $discVal = 0;

            if ($d->discount !== null && $d->discount_type) {
                if ($d->discount_type === 'percentage') {
                    $discVal = $price * $qty * ((float)$d->discount / 100);
                } else {
                    $discVal = (float)$d->discount * $qty;
                }
            }

            $amount = ($price * $qty) - $discVal;

            $name = '-';
            $unit = '-';

            if ($d->items_type === \App\Models\ProductVariant::class) {
                $product = $d->items->product ?? null;
                if ($product) {
                    if ($product->has_variant) {
                        $variants = $d->items->product_variant_values ?? [];
                        $variantList = collect($variants)->map(function ($v) {
                            return ($v->variant_value->variant_option->name ?? '-') . ':' . ($v->variant_value->name ?? '-');
                        })->join(', ');
                        $name = $product->name . ' [' . $variantList . ']';
                    } else {
                        $name = $product->name ?? '-';
                    }
                }
                $unit = $d->items->unit->name ?? '-';
            } elseif ($d->items_type === \App\Models\Menu::class) {
                $name = $d->items->name ?? '-';
                $unit = $d->items->unit->name ?? '-';
            } elseif ($d->items_type === \App\Models\DiscountPackage::class) {
                $name = ($d->items->name ?? 'Paket Diskon');
                $unit = '-';
            } else {
                $name = $d->items->name ?? ($d->items->title ?? '-');
            }

            $rows[] = [
                'no'      => $index + 1,
                'name'    => $name,
                'qty'     => $qty,
                'price'   => $price,
                'unit'    => $unit,
                'disc'    => $discVal,
                'amount'  => $amount,
                'expired' => $d->expired_at ?? null,
                'note'    => $d->note ?? null,
            ];
        }

        $subtotal = (float)($trx->subtotal ?? array_sum(array_column($rows, 'amount')) + (float)($trx->discount ?? 0));
        $discountGlobal = (float)($trx->discount ?? 0);
        $grandTotal = (float)($trx->grand_total ?? ($subtotal - $discountGlobal));
        $pay = (float)($trx->pay ?? 0);
        $remaining = max($grandTotal - $pay, 0);
    @endphp

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width:50px;">No</th>
                <th>Item</th>
                <th class="text-center" style="width:90px;">Qty</th>
                <th class="right" style="width:110px;">Harga</th>
                <th class="right" style="width:110px;">Diskon</th>
                <th class="right" style="width:120px;">Total</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($rows as $r)
            <tr>
                <td class="text-center">{{ $r['no'] }}</td>
                <td>
                    {{ $r['name'] }}
                    @if($r['note'])
                        <div style="font-size:10px;color:#777;margin-top:2px;">Catatan: {{ $r['note'] }}</div>
                    @endif
                </td>
                <td class="text-center">{{ (int)$r['qty'] }}</td>
                <td class="right">Rp {{ number_format($r['price'], 0) }}</td>
                <td class="right">Rp {{ number_format($r['disc'], 0) }}</td>
                <td class="right">Rp {{ number_format($r['amount'], 0) }}</td>
            </tr>
        @endforeach
            <tr class="total-row">
                <td colspan="5" class="right">Subtotal</td>
                <td class="right">Rp {{ number_format($subtotal, 0) }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="5" class="right">Diskon</td>
                <td class="right">Rp {{ number_format($discountGlobal, 0) }}</td>
            </tr>
            @foreach($trx->transaction_taxs as $tax)
                <tr class="total-row">
                    <td colspan="5" class="right">{{ $tax->name }}</td>
                    <td class="right">Rp {{ number_format($tax->value, 0) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="5" class="right">Grand Total</td>
                <td class="right">Rp {{ number_format($grandTotal, 0) }}</td>
            </tr>
        </tbody>
    </table>
    <table class="payment-table">
        <thead>
            <tr>
                <th class="text-center" style="width:50px;">No</th>
                <th>Tanggal Pembayaran</th>
                <th>Metode Pembayaran</th>
                <th>Akun Bank</th>
                <th class="right" style="width: 20%;">Jumlah Bayar</th>
            </tr>
        </thead>
        <tbody>
            @if($trx->pay > 0)
                <tr>
                    <td class="text-center">1</td>
                    <td>{{ \Carbon\Carbon::parse($trx->transaction_date)->format('d/m/Y') }}</td>
                    <td>{{ strtoupper($trx->payment_method ?? '-') }}</td>
                    <td>
                        @php
                            $bank = $transaction->bank_account ?? null;
                            $bankName = $bank->bank_name ?? $p->bank_name ?? null;
                            $accName  = $bank->account_name ?? $p->account_name ?? null;
                            $accNo    = $bank->account_number ?? $p->account_number ?? null;
                        @endphp
                        @if($bankName || $accName || $accNo)
                            {{ $bankName }} - {{ $accName }} [{{ $accNo }}]
                        @else
                            -
                        @endif
                    </td>
                    <td class="right">Rp {{ number_format((float)$trx->pay, 0) }}</td>
                </tr>
            @endif
            @foreach ($trx->transaction_payments as $i => $p)
                <tr>
                    <td class="text-center">{{ $i + 2 }}</td>
                    <td>{{ \Carbon\Carbon::parse($p->paid_at ?? $p->created_at)->format('d/m/Y') }}</td>
                    <td>{{ strtoupper($p->method ?? $p->payment_method ?? '-') }}</td>
                    <td>
                        @php
                            // Dukungan dua kemungkinan skema:
                            $bank = $p->bank_account ?? null;
                            $bankName = $bank->bank_name ?? $p->bank_name ?? null;
                            $accName  = $bank->account_name ?? $p->account_name ?? null;
                            $accNo    = $bank->account_number ?? $p->account_number ?? null;
                        @endphp
                        @if($bankName || $accName || $accNo)
                            {{ $bankName }} - {{ $accName }} [{{ $accNo }}]
                        @else
                            -
                        @endif
                    </td>
                    <td class="right">Rp {{ number_format((float)$p->amount, 0) }}</td>
                </tr>
                @if(!empty($p->notes))
                    <tr>
                        <td></td>
                        <td colspan="4" style="font-size:10px;color:#777;">
                            Catatan: {{ $p->notes }}
                        </td>
                    </tr>
                @endif
            @endforeach
            <tr class="total-row">
                <td colspan="4" class="right"><strong>Total Bayar</strong></td>
                <td class="right">Rp {{ number_format($pay + $trx->transaction_payments->sum('amount'), 0) }}</td>
            </tr>
        </tbody>
    </table>

    @if($trx->notes_note)
        <div style="page-break-inside: avoid; margin-top: 16px; border: 1px solid #ccc; padding: 10px 14px; background-color: #fdfdfd; border-radius: 4px;">
            <strong>Catatan:</strong>
            <div style="margin-top: 6px;">{{ $trx->notes_note }}</div>
        </div>
    @endif

    <div style="page-break-inside: avoid; margin-top: 16px; border: 1px solid #ccc; padding: 10px 14px; background-color: #fdfdfd; border-radius: 4px;">
        <strong>Informasi Bank Transfer:</strong>
        @foreach($banks as $bank)
            <div style="margin-top: 6px; text-transform:uppercase">{{ $bank->bank_name }} - {{ $bank->account_name }} [{{ $bank->account_number }}]</div>
        @endforeach
    </div>

    <div class="footer-print">
        Dicetak pada: {{ now()->format('d-m-Y H:i') }} oleh WIOOS
    </div>
</body>
</html>
