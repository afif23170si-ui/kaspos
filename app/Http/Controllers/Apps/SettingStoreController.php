<?php

namespace App\Http\Controllers\Apps;

use App\Models\Shift;
use App\Models\Setting;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CustomerPointSetting;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class SettingStoreController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:settings-data', only: ['index']),
            new Middleware('permission:settings-bank', only: ['storeBank']),
            new Middleware('permission:settings-shift', only: ['storeShift']),
            new Middleware('permission:settings-setting', only: ['storeSetting']),
            new Middleware('permission:settings-loyalty', only: ['storeCustomerLoyalty']),
        ];
    }

    public function index()
    {
        // get all banks account
        $banks = BankAccount::select('id', 'bank_name', 'account_name', 'account_number')->get();

        // get all shifts
        $shifts = Shift::select('id', 'code', 'name', 'start_time', 'end_time')->get();

        // get all settings
        $settings = Setting::select('id', 'name', 'code', 'value', 'is_active')->get();

        // get all customer point settings
        $customerPointSettings = CustomerPointSetting::select('id', 'spend_amount', 'point_earned', 'expired_in_days', 'is_active')->get();

        // render view
        return inertia('apps/setting-stores/index', [
            'banks' => $banks,
            'shifts' => $shifts,
            'settings' => $settings,
            'customerPointSettings' => $customerPointSettings
        ]);
    }

    public function storeBank(Request $request)
    {
        // validate request
        $request->validate([
            'banks' => 'required|array|min:1',
            'banks.*.bank_name' => 'required',
            'banks.*.account_number' => 'required|numeric',
            'banks.*.account_name' => 'required|string',
        ], [
            'banks.*.bank_name.required' => 'Kolom nama bank tidak boleh kosong.',
            'banks.*.account_number.required' => 'Kolom nomor rekening tidak boleh kosong.',
            'banks.*.account_number.numeric' => 'Kolom nomor rekening harus berupa angka.',
            'banks.*.account_name.required' => 'Kolom nama pemilik rekening tidak boleh kosong.',
        ]);

        // get request banks and pluck key bank_name
        $currentBankName = collect($request->banks)->pluck('bank_name')->toArray();

        // delete bank account where not in request
        BankAccount::whereNotIn('bank_name', $currentBankName)->delete();

        // loop request banks
        collect($request->banks)->each(function($item){
            BankAccount::updateOrCreate([
                'bank_name' => $item['bank_name']
            ],[
                'account_number' => $item['account_number'],
                'account_name' => $item['account_name']
            ]);
        });

        // render view
        return back();
    }

    public function storeShift(Request $request)
    {
        // validate request
        $request->validate([
            'shifts' => 'required|array|min:1',
            'shifts.*.code' => 'required',
            'shifts.*.name' => 'required',
            'shifts.*.start_time' => 'required',
            'shifts.*.end_time' => 'required',
        ], [
            'shifts.*.code.required' => 'Kolom kode shift tidak boleh kosong.',
            'shifts.*.name.required' => 'Kolom nama shift tidak boleh kosong.',
            'shifts.*.start_time.required' => 'Kolom jam mulai tidak boleh kosong.',
            'shifts.*.end_time.required' => 'Kolom jam akhir tidak boleh kosong.',
        ]);

        // get request shifts and pluck key shift_code
        $currentShiftName = collect($request->shifts)->pluck('code')->toArray();

        // delete shift where not in request
        Shift::whereNotIn('code', $currentShiftName)->delete();

        // loop request shifts
        collect($request->shifts)->each(function($item){
            Shift::updateOrCreate([
                'code' => $item['code']
            ],[
                'name' => $item['name'],
                'start_time' => $item['start_time'],
                'end_time' => $item['end_time']
            ]);
        });

        // render view
        return back();
    }

    public function storeSetting(Request $request)
    {
        // validate request
        $request->validate([
            'settings' => 'required|array|min:1',
            'settings.*.code' => 'required',
            'settings.*.name' => 'required',
            'settings.*.value' => 'required',
            'settings.*.is_active' => 'required',
        ], [
            'settings.*.code.required' => 'Kolom kode tidak boleh kosong.',
            'settings.*.name.required' => 'Kolom nama tidak boleh kosong.',
            'settings.*.value.required' => 'Kolom value tidak boleh kosong.',
            'settings.*.is_active.required' => 'Kolom aktif tidak boleh kosong.',
        ]);

        // get request settings and pluck key name
        $currentSettingName = collect($request->settings)->pluck('name')->toArray();

        // delete settings where not in request
        Setting::whereNotIn('name', $currentSettingName)->delete();

        foreach ($request->settings as $idx => $row) {
            $code = strtoupper($row['code'] ?? '');
            $name = $row['name'] ?? null;
            $isActive = ($row['is_active'] ?? '0') == '1';

            $value = $row['value'] ?? '';

            if ($code === 'LOGO' && $request->hasFile("settings.$idx.value")) {
                $request->validate([
                    "settings.$idx.value" => ['required', 'image', 'mimes:png,jpg,jpeg,webp,svg', 'max:1024'],
                ], [
                    "settings.$idx.value.required" => 'File logo wajib diisi.',
                    "settings.$idx.value.image" => 'File logo harus berupa gambar.',
                    "settings.$idx.value.mimes" => 'Format logo harus PNG/JPG/JPEG/WEBP/SVG.',
                    "settings.$idx.value.max" => 'Ukuran logo maksimal 1 MB.',
                ]);

                $file = $request->file("settings.$idx.value");
                $path = $file->store('logos', 'public');
                $value = '/storage/' . $path;
            } else {
                if ($value === '' && $code !== 'LOGO') {
                    return back()->withErrors([
                        "settings.$idx.value" => 'Kolom value tidak boleh kosong.',
                    ])->withInput();
                }
            }

            Setting::updateOrCreate(
                ['name' => $name],
                [
                    'code' => $code,
                    'value' => $value,
                    'is_active' => $isActive,
                ]
            );
        }

        return back();
    }

    public function storeCustomerLoyalty(Request $request)
    {
        // validate request
        $request->validate([
            'loyalty' => 'required|array|min:1',
            'loyalty.*.spend_amount' => 'required',
            'loyalty.*.point_earned' => 'required',
            'loyalty.*.expired_in_days' => 'required',
            'loyalty.*.is_active' => 'required',
        ], [
            'loyalty.*.spend_amount.required' => 'Kolom minimal pembelian tidak boleh kosong.',
            'loyalty.*.point_earned.required' => 'Kolom poin yang diberikan tidak boleh kosong.',
            'loyalty.*.expired_in_days.required' => 'Kolom masa berlaku poin tidak boleh kosong.',
            'loyalty.*.is_active.required' => 'Kolom aktif tidak boleh kosong.',
        ]);

        // get request loyalty and pluck key point_earned
        $currentLoyaltyPoint = collect($request->loyalty)->pluck('point_earned')->toArray();

        // delete settings where not in request
        CustomerPointSetting::whereNotIn('point_earned', $currentLoyaltyPoint)->delete();

        // loop request loyalty
        collect($request->loyalty)->each(function($item){
            CustomerPointSetting::updateOrCreate([
                'point_earned' => $item['point_earned']
            ],[
                'spend_amount' => $item['spend_amount'],
                'expired_in_days' => $item['expired_in_days'],
                'is_active' => $item['is_active'] == 1 ? true : false
            ]);
        });

        // render view
        return back();
    }
}
