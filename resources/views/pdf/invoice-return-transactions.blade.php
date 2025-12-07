<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice Retur Penjualan - {{ $transactionReturn->return_code }}</title>
    <style>
        @page {
            margin: 20mm 10mm 10mm 10mm;
        }

        .footer-print {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 10px;
            text-align: right;
            padding: 2mm 10mm 0 10mm;
            box-sizing: border-box;
            border-top: 1px solid #ccc;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 20px;
        }

        h1,
        h2,
        h3 {
            margin-bottom: 5px;
            color: #222;
        }

        .header,
        .supplier-info,
        .order-info {
            margin-bottom: 20px;
        }

        .order-info {
            text-align: right;
            max-width: 50%;
        }

        .invoice-code {
            background: #f0f0f0;
            padding: 8px 12px;
            font-weight: bold;
            border-radius: 4px;
            display: inline-block;
            margin-top: 4px;
            min-width: 165px;
        }

        .section-title {
            border-bottom: 1px solid #ddd;
            margin-bottom: 8px;
            padding-bottom: 4px;
            font-weight: bold;
            font-size: 1em;
        }

        .info-grid>div {
            width: 48%;
            float: left;
            vertical-align: top;
            margin-right: 16px;
        }

        .info-grid>div:last-child {
            margin-right: 0;
        }

        .info-grid::after {
            content: "";
            display: table;
            clear: both;
        }


        .header-grid>div {
            float: left;
            vertical-align: top;
            margin-right: 16px;
        }

        .header-grid>div:last-child {
            margin-right: 0;
        }

        .store-logo {
            width: 80px;
        }

        .store-info {
            position: relative;
            top: -15px;
            width: calc(100% - 80px - 200px - 32px);

        }

        .invoice-info {
            position: relative;
            top: -35px;
            width: 200px;
            text-align: right;
        }

        .header-grid::after {
            content: "";
            display: table;
            clear: both;
        }




        .invoice-info h1 {
            margin: 0 0 5px 0;
        }

        .info-item {
            margin-bottom: 6px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            font-size: 10.5px;
            text-align: left;
        }

        th {
            background: #f9f9f9;
        }

        td.right {
            text-align: right;
        }

        .total-row {
            font-weight: bold;
            background: #f9f9f9;
        }

        .text-center {
            text-align: center;
        }

        .payment-table {
            margin-top: 20px;
        }

        .payment-table th {
            background-color: #e3f2fd;
        }
    </style>
</head>

<body>
    <div class="header header-grid">
        <div class="store-logo">
            @if(!empty($store['logo_data_uri']))
                <img src="{{ $store['logo_data_uri'] }}" alt="Logo" style="max-height: 80px;">
            @else
                <img src="{{ public_path('NoImage.png') }}" alt="Logo" style="max-height: 80px;">
            @endif
        </div>

        <div class="store-info">
            <div class="info-item">
                <h2>{{ $store['name'] ?? 'WIOOS' }}</h2>
            </div>
            <div class="info-item">{{ $store['addr'] ?? '-' }}</div>
            <div class="info-item">{{ $store['phone'] ?? '-' }}</div>
        </div>

        <div class="invoice-info">
            <h1>Invoice Retur Penjualan</h1>
            <div class="invoice-code">{{ $transactionReturn->return_code }}</div>
        </div>
    </div>

    <div class="info-grid">
        <div class="supplier-info">
            <div class="section-title">Informasi Customer</div>
            <div class="info-item"><strong>Nama:</strong>{{ $transactionReturn->transaction->customer->name ?? 'Umum' }}</div>
            <div class="info-item"><strong>Email:</strong>{{ $transactionReturn->transaction->customer->email ?? '' }}</div>
            <div class="info-item"><strong>Telepon:</strong>{{ $transactionReturn->transaction->customer->phone ?? '' }}</div>
            <div class="info-item"><strong>Alamat:</strong>{{ $transactionReturn->transaction->customer->address ?? '' }}</div>
        </div>
        <div class="order-info">
            <div class="section-title">Detail Retur Penjualan</div>
            <div class="info-item"><strong>Status Retur Penjualan:</strong>
                @php
                    $statusOrder = [
                        'confirmed' => 'Diterima',
                        'pending' => 'Diajukan',
                    ];
                @endphp
                {{ $statusOrder[$transactionReturn->status] ?? 'Status Tidak Dikenal' }}
            </div>
            <div class="info-item"><strong>Jenis Retur:</strong>
                @php
                    $refundMethod = [
                        'refund' => 'Pengembalian Dana',
                        'replacement' => 'Pergantian Barang',
                    ];
                @endphp
                {{ $refundMethod[$transactionReturn->refund_method] ?? 'Status Tidak Dikenal' }}
            </div>
            <div class="info-item"><strong>Tanggal Retur:</strong>
                {{ $transactionReturn->return_date }}
            </div>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th class="text-center">No</th>
                <th>Item</th>
                <th>Alasan Retur</th>
                <th class="text-center">Qty</th>
                <th class="right">Harga</th>
                <th class="right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transactionReturn->details as $index => $detail)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        @switch($detail->transaction_detail->items_type)
                            @case('App\\Models\\ProductVariant')
                                @php
                                    $product = $detail->transaction_detail->items->product ?? null;
                                    if ($product && $product->has_variant) {
                                        $variants = $detail->transaction_detail->items->product_variant_values ?? [];
                                        $variantList = collect($variants)
                                            ->map(function ($v) {
                                                return $v->variant_value->variant_option->name .
                                                    ':' .
                                                    $v->variant_value->name;
                                            })
                                            ->join(', ');
                                        echo $product->name . " [{$variantList}]";
                                    } else {
                                        echo $product->name ?? '-';
                                    }
                                @endphp
                            @break
                            @case('App\\Models\\DiscountPackage')
                                {{ $detail->transaction_detail->items->name }}
                            @break
                            @case('App\\Models\\Menu')
                                {{ $detail->transaction_detail->items->name }}
                            @break
                        @endswitch
                    </td>
                    <td>{{ $detail->reason }}</td>
                    <td class="text-center">{{ $detail->quantity }}</td>
                    <td class="right">Rp {{ number_format($detail->transaction_detail->price, 0) }}</td>
                    <td class="right">Rp {{ number_format($detail->total_price, 0) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="5" class="right">Grand Total</td>
                <td class="right">Rp {{ number_format($transactionReturn->grand_total, 0) }}</td>
            </tr>
        </tbody>
    </table>
    <div
        style="page-break-inside: avoid; margin-top: 20px; border: 1px solid #ccc; padding: 10px 14px; background-color: #fdfdfd; border-radius: 4px;">
        <strong>Catatan:</strong>
        <ol style="padding-left: 20px; margin-top: 8px; margin-bottom: 0;">
            {{ $transactionReturn->notes }}
        </ol>
    </div>

    <div class="info-grid" style="margin-top: 60px; text-align: center; font-size: 11px;">
        <div style="page-break-inside: avoid;">
            <div>Penerima</div>
            <br><br><br>
            <div>(____________________)</div>
            <div>{{ $transactionReturn->transaction->customer->name ?? 'Umum' }}</div>
        </div>
        <div style="page-break-inside: avoid;">
            <div>Pembuat</div>
            <br><br><br>
            <div>(____________________)</div>
            <div>{{ $transactionReturn->user_created->name }}</div>
        </div>
    </div>

    <div class="footer-print">
        Dicetak pada: {{ now()->format('d-m-Y') }} oleh WIOOS
    </div>

</body>

</html>
