<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shifts = [
            [
                'name' => 'Pagi',
                'code' => 'PG',
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sore',
                'code' => 'SR',
                'start_time' => '16:00:00',
                'end_time' => '24:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('shifts')->insert($shifts);
    }
}
