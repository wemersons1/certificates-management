<?php

namespace App\Http\Controllers;

use App\Http\Requests\VerifyIfFieldIsAvailable\DocumentAvailableRequest;
use App\Http\Requests\VerifyIfFieldIsAvailable\EmailAvailableRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class VerifyIfFieldIsAvailableController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function verifyDocument(DocumentAvailableRequest $request)
    {
        $data = $request->validated();

        $available = $this->existUserWithTheSameDocument($data['document'], 'document');

        return response()->json([
            "is_available" => !!!$available
        ]);
    }

    public function verifyEmail(EmailAvailableRequest $request)
    {
        $data = $request->validated();

        $available = $this->existUserWithTheSameDocument($data['email'], 'email');

        return response()->json([
            "is_available" => !!! $available
        ]);
    }

    private function existUserWithTheSameDocument($data, $field)
    {
        $user = User::where("$field", $data);

        return $user->first();
    }
}
