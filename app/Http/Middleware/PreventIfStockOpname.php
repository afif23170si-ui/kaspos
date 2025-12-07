<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\CheckingStock;
use Symfony\Component\HttpFoundation\Response;

class PreventIfStockOpname
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isOpnameActive = CheckingStock::where('status', 'draft')->exists();

        if ($isOpnameActive)
            return inertia('apps/errors/opname')->toResponse($request);

        return $next($request);
    }
}
