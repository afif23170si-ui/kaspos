<?php

namespace App\Http\Controllers\Apps;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:report-audit-logs', only: ['index', 'show']),
        ];
    }

    public function index(Request $request)
    {
        // request page data
        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $filters = $request->validate([
            'q'          => ['nullable','string'],
            'log_name'   => ['nullable','string'],
            'event'      => ['nullable','string'],
            'user_id'    => ['nullable','integer'],
            'date_from'  => ['nullable','date'],
            'date_to'    => ['nullable','date'],
            'has_props'  => ['nullable','boolean'],
            'per_page'   => ['nullable','integer'],
            'export'     => ['nullable','in:csv'],
        ]);

        $base = Activity::query()
            ->with(['causer:id,name'])
            ->when($filters['q'] ?? $request->serach ?? null, function ($w, $q) {
                $w->where(function($x) use ($q) {
                    $x->where('description','like',"%{$q}%")
                      ->orWhere('log_name','like',"%{$q}%")
                      ->orWhere('event','like',"%{$q}%")
                      ->orWhere('subject_type','like',"%{$q}%")
                      ->orWhere('properties','like',"%{$q}%");
                });
            })
            ->when($filters['log_name'] ?? null, function($query) use($filters){
                if($filters['log_name'] != 'all')
                    $query->where('log_name', $filters['log_name']);
            })
            ->when($filters['event'] ?? null, function($query) use($filters){
                if($filters['event'] != 'all')
                    $query->where('event', $filters['event']);
            })
            ->latest();

        // Export CSV quick
        if (($filters['export'] ?? null) === 'csv') {
            $filename = 'audit_logs_'.now()->format('Ymd_His').'.csv';
            return new StreamedResponse(function() use ($base) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['id','created_at','log_name','event','description','subject_type','subject_id','causer_id','causer_name']);
                $base->clone()->limit(5000)->chunk(500, function($rows) use ($out){
                    foreach ($rows as $a) {
                        fputcsv($out, [
                            $a->id,
                            $a->created_at,
                            $a->log_name,
                            $a->event,
                            $a->description,
                            $a->subject_type,
                            $a->subject_id,
                            $a->causer_id,
                            optional($a->causer)->name,
                        ]);
                    }
                });
                fclose($out);
            }, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename={$filename}",
            ]);
        }
        $logs = $base->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // dropdown options
        $logNames  = Activity::query()->select('log_name')->distinct()->orderBy('log_name')->pluck('log_name')->filter()->values();
        $events    = Activity::query()->select('event')->distinct()->orderBy('event')->pluck('event')->filter()->values();

        return inertia('apps/audit/index', [
            'logs'    => $logs,
            'filters' => $filters,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
            'options' => [
                'log_names' => $logNames,
                'events'    => $events,
            ],
        ]);
    }

    public function show(Activity $activity)
    {
        $activity->load(['causer:id,name']);
        return response()->json([
            'id'           => $activity->id,
            'created_at'   => $activity->created_at,
            'log_name'     => $activity->log_name,
            'event'        => $activity->event,
            'description'  => $activity->description,
            'subject_type' => $activity->subject_type,
            'subject_id'   => $activity->subject_id,
            'causer'       => $activity->causer ? ['id'=>$activity->causer->id,'name'=>$activity->causer->name] : null,
            'properties'   => $activity->properties,
        ]);
    }
}
