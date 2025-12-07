<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16px; }
        .header p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
        th { background-color: #f0f0f0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { margin-top: 20px; width: 40%; float: right; }
        .totals table { border: none; }
        .totals td { border: none; padding: 2px; }
        .totals .amount { font-weight: bold; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN PENJUALAN</h1>
        <p>Periode: {{ \Carbon\Carbon::parse($range['start_date'])->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($range['end_date'])->format('d/m/Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" width="5%">No</th>
                <th width="10%">Tanggal</th>
                <th width="15%">No. Transaksi</th>
                <th width="20%">Keterangan</th>
                <th width="10%">Metode</th>
                <th width="10%">Bank</th>
                <th width="15%" class="text-right">Jumlah</th>
                <th width="10%" class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $index => $row)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $row['tanggal'] }}</td>
                <td>{{ $row['no_transaksi'] }}</td>
                <td>{{ $row['keterangan'] }}</td>
                <td>{{ ucfirst($row['metode_bayar']) }}</td>
                <td>{{ strtoupper($row['bank']) }}</td>
                <td class="text-right">Rp {{ number_format($row['jumlah'], 0, ',', '.') }}</td>
                <td class="text-center">{{ ucfirst($row['status_tempo']) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center">Tidak ada data untuk periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Total Penjualan:</td>
                <td class="amount">Rp {{ number_format($totals['total_penjualan'], 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Total Penerimaan:</td>
                <td class="amount">Rp {{ number_format($totals['total_penerimaan'], 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Piutang (Semua):</td>
                <td class="amount">Rp {{ number_format($totals['outstanding_all'], 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>
</body>
</html>
