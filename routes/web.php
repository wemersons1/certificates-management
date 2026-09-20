<?php

use App\Http\Controllers\ConfigSystemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


use App\Http\Controllers\SocialAuthController;

Route::view('/', 'home')->name('home');
Route::view('/blog', 'blog');
Route::view('/sobre', 'about');
Route::view('/blog/como-emitir-certificados-online-gratuitamente', 'blog.como-emitir-certificados-online-gratuitamente');
Route::view('/blog/modelos-de-certificados-para-cursos-e-treinamentos', 'blog.modelos-de-certificados-para-cursos-e-treinamentos');
Route::view('/blog/como-validar-certificados-de-cursos-online', 'blog.como-validar-certificados-de-cursos-online');
Route::view('/sobre', 'about');
Route::view('/politica-de-privacidade', 'policy-and-privacy');
Route::view('/document-validate/{uuid}', 'document-validate');

Route::get('/auth/callback/google', [SocialAuthController::class, 'googleCallback']);
Route::get('/auth/callback/linkedin', [SocialAuthController::class, 'linkedinCallback']);

Route::view('/{path?}', 'app')
    ->where('path', '.*');
