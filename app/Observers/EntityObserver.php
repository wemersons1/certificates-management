<?php

namespace App\Observers;

use App\Models\DocumentTemplateFrame;
use App\Models\Entity;
use App\Models\NotificationTemplateConfig;
use Illuminate\Support\Facades\DB;

class EntityObserver
{
    public function created(Entity $entity): void
    {
        $notificationTemplateConfig = NotificationTemplateConfig::create([
            'title' => '',
            'content' => '',
            'active' => false,
            'send_me' => false,
            'quantity_days_for_notification' => 3,
            'default_sender' => env('MAIL_FROM_ADDRESS'),
        ]);

        $entity->notification_config_email_id = $notificationTemplateConfig->id;
        $entity->save();

        $frames = [
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f564f0cc8135.50018954.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f564e82db062.07028549.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f56858881c25.15301084.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f5655ecd2671.78700272.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f5684ad80bc2.33539207.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f564f7786295.65681864.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f5655ecd2671.78700272.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f5656f52dc05.63362756.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f568624da091.29195117.webp',
            'https://flash-certificados-bucket.s3.sa-east-1.amazonaws.com/frames/logo_68f5683e3e1b21.03649681.webp',
        ];

        $templateFrames = [];

        foreach ($frames as $frame) {
            $templateFrames[] = [
                'frame' => $frame,
                'entity_id' => $entity->id,
            ];
        }

        DB::table('document_template_frames')->insert($templateFrames);
    }
}
