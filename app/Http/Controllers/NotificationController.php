<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function lastNotificationDetails()
    {
        $lastSixNotifications = Notification::myScope()->limit(6)->get();
        $totalDontRead = Notification::myScope()->where('is_read', false)->count();
        
        return [
            'notifications' => $lastSixNotifications,
            'total_dont_read' => $totalDontRead
        ];
    }

    public function update(Request $request, string $id)
    {
        $notification = Notification::myScope()->findOrFail($id);
        
        $notification->is_read = $request->is_read;
        $notification->save();

        return $notification;
    }

    public function index()
    {
        return Notification::myScope()->paginate();
    }
}
