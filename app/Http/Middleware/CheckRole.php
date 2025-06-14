<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if(!auth()->check()){
            return redirecet()->route('login');
        }

        $user = auth()->user();

        if($user->hasAnyRole($roles)){
            return $next($request);
        }
        abort(403, 'Bạn không có quyền truy cập trang này.');
    }
}
