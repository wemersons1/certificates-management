<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseAssetController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EntityController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\VerifyIfFieldIsAvailableController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentTemplateFrameController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\EntitiesAvailableForEmail;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSendController;
use App\Http\Controllers\NotificationTemplateConfigController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\CreditPackageController;
use App\Http\Controllers\CreditPackageCheckoutController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\SesAwsController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\SynchronizeStatusPaymentController;
use App\Http\Controllers\SynchronizeStatusSubscriptionController;
use App\Http\Controllers\TermAndConditionController;
use App\Http\Controllers\BusinessSegmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\GoogleMapsController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:15,2')->post('/login', [SessionController::class, 'login']);
Route::get('/auth/callback/google', [SocialAuthController::class, 'googleCallback']);
Route::get('/auth/callback/linkedin', [SocialAuthController::class, 'linkedinCallback']);
Route::middleware('throttle:10,2')->post('/social-login', [SocialAuthController::class, 'login']);
Route::middleware('throttle:30,1')->get('/setup', SetupController::class);
Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);
Route::middleware('throttle:10,1')->post('/change-password', [ResetPasswordController::class, 'changePassword']);

Route::post('/syncronize-status-subscription', SynchronizeStatusSubscriptionController::class);
Route::post('/syncronize-status-payment', SynchronizeStatusPaymentController::class);
Route::middleware('throttle:12,1')->get('/entities-available-email', EntitiesAvailableForEmail::class);
Route::middleware('throttle:12,1')->get('/email-available', [VerifyIfFieldIsAvailableController::class, 'verifyEmail']);
Route::post('/ses/bounce', [SesAwsController::class, 'handle']);
Route::middleware('throttle:10,1')->post('/signup', [UserController::class, 'signUp']);
Route::post('/ses/verify-email', [SesAwsController::class, 'verifyEmail']);
Route::get('business-segments', [BusinessSegmentController::class, 'index']);
Route::get('/public/events/code/{code}/issue-checkin-link', [EventController::class, 'issueCheckinLinkByCode']);
Route::get('/public/events/{uuid}', [EventController::class, 'showByUuid']);
Route::get('/public/events/{uuid}/issue-checkin-link', [EventController::class, 'issuePublicCheckinLink']);
Route::get('/public/events/checkin/{token}', [EventController::class, 'showPublicCheckinByToken']);
Route::post('/public/events/checkin/{token}', [EventController::class, 'publicCheckinByToken']);
Route::post('/public/events/checkin/{token}/resend-certificate', [EventController::class, 'resendCertificateByToken']);
Route::get('/public/documents/{uuid}/download', [EventController::class, 'publicDownloadCertificate']);

Route::middleware('throttle:12,1')->get('/document-validate/{uuid}', [DocumentController::class, 'documentValidate']);

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('throttle:5,1')->post('/resend-confirmation-code', [UserController::class, 'resendConfirmationCode']);
    Route::middleware('throttle:5,1')->post('/validate-code', [UserController::class, 'validateCode']);
    Route::get('me', [UserController::class, 'me']);
    Route::put('me', [UserController::class, 'updateMe']);
    Route::put('logo', [UserController::class, 'updateLogo']);
    Route::post('users/complete-registration', [UserController::class, 'completeRegistration']);
    Route::put('/cancel-contract/{id}', [UserController::class, 'cancelContract']);
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('menu-items', [EntityController::class, 'getMenuItems']);

    Route::get('/dashboard', [DashboardController::class, 'report']);
    Route::get('/instructors/name-available', [InstructorController::class, 'verifyName']);
    Route::get('/positions/name-available', [PositionController::class, 'verifyName']);
    Route::get('/maps/search-address', [GoogleMapsController::class, 'searchAddress']);
    Route::get('/maps/reverse-address', [GoogleMapsController::class, 'reverseAddress']);

    Route::resource('instructors', InstructorController::class);
    Route::resource('users', UserController::class);
    Route::resource('events', EventController::class);
    Route::patch('events/{id}/toggle-certificates-close', [EventController::class, 'toggleCertificatesClose']);
    Route::patch('users/{user}/mark-welcome-message-sent', [UserController::class, 'markWelcomeMessageSent']);
    Route::resource('companies', CompanyController::class);
    Route::resource('employees', EmployeeController::class);
    Route::post('employees/batch', [EmployeeController::class, 'employeesBatch']);
    Route::post('employees/update-emails', [EmployeeController::class, 'updateEmails']);

    Route::resource('entities', EntityController::class);
    Route::resource('email-templates', EmailTemplateController::class);
    Route::resource('courses', CourseController::class);
    Route::post('courses/import-template', [CourseController::class, 'importTemplate']);
    Route::delete('courses/{id}/files/{fileId}', [CourseController::class, 'deleteFile']);
    Route::get('courses/{id}/files/{fileId}/download', [CourseController::class, 'downloadFile']);
    Route::post('courses/{id}/files', [CourseController::class, 'uploadFiles']);

    // Course logo (1-to-1) and signatures (1-to-many)
    Route::get('courses/{courseId}/logo', [CourseAssetController::class, 'getLogo']);
    Route::put('courses/{courseId}/logo', [CourseAssetController::class, 'saveLogo']);
    Route::delete('courses/{courseId}/logo', [CourseAssetController::class, 'deleteLogo']);
    Route::get('courses/{courseId}/signatures', [CourseAssetController::class, 'getSignatures']);
    Route::post('courses/{courseId}/signatures', [CourseAssetController::class, 'addSignature']);
    Route::put('courses/{courseId}/signatures/sync', [CourseAssetController::class, 'syncSignatures']);
    Route::put('courses/{courseId}/signatures/{sigId}', [CourseAssetController::class, 'updateSignature']);
    Route::delete('courses/{courseId}/signatures/{sigId}', [CourseAssetController::class, 'deleteSignature']);
    Route::resource('positions', PositionController::class);
    Route::resource('document-templates', DocumentTemplateController::class);
    Route::resource('document-template-frames', DocumentTemplateFrameController::class);
    Route::resource('notification-send', NotificationSendController::class);
    Route::resource('plans', PlanController::class);
    Route::resource('credit-packages', CreditPackageController::class);
    Route::resource('term-conditions', TermAndConditionController::class);
    Route::get('plan-benefits', [PlanController::class, 'planBenefits']);

    Route::get('template-types', [DocumentTemplateController::class, 'templateTypes']);
    Route::get('states', [RegionController::class, 'states']);
    Route::get('cities', [RegionController::class, 'cities']);
    Route::get('genders', [EmployeeController::class, 'genders']);

    Route::post('/companies/import', [CompanyController::class, 'import']);
    Route::post('/employees/import', [EmployeeController::class, 'import']);
    Route::post('/employees/import/{companyId}', [EmployeeController::class, 'import']);
    Route::post('/notification-template-config', [NotificationTemplateConfigController::class, 'store']);

    Route::get('user-permissions', [UserController::class, 'permissions']);

    Route::post('/checkout/free-plan', [CheckoutController::class, 'freePlan']);
    Route::post('/checkout/generate-qrcode', [CheckoutController::class, 'generateQrcode']);
    Route::post('/checkout/charge-credit-card', [CheckoutController::class, 'chargeCreditCard']);
    Route::post('/checkout/subscription', [CheckoutController::class, 'registerSubscription']);
    Route::get('/checkout/payment-details', [CheckoutController::class, 'paymentDetails']);

    // Credit package checkout (buy add-on credits)
    Route::get('/credit-packages-shop', [CreditPackageCheckoutController::class, 'packages']);
    Route::post('/credit-packages-shop/pix', [CreditPackageCheckoutController::class, 'generatePixQrcode']);
    Route::post('/credit-packages-shop/charge-card', [CreditPackageCheckoutController::class, 'chargeCreditCard']);
    Route::get('/credit-packages-shop/orders/{orderId}/status', [CreditPackageCheckoutController::class, 'pollOrderStatus']);
    
    Route::get('documents/download/{id}', [DocumentController::class, 'download']);
    Route::get('documents/html/{id}', [DocumentController::class, 'html']);
    Route::post('documents/send-email', [DocumentController::class, 'sendEmail']);
    Route::post('documents/send-email-batch', [DocumentController::class, 'sendEmailBatch']);
    Route::get('documents/{id}/check-email', [DocumentController::class, 'checkEmailSent']);
    Route::apiResource('documents', DocumentController::class);

    Route::get('/credits/balance', [App\Http\Controllers\CreditController::class, 'balance']);
    Route::post('/credits/resume', [App\Http\Controllers\CreditController::class, 'resume']);
    Route::post('/credits/upgrade', [App\Http\Controllers\CreditController::class, 'upgrade']);

    Route::get('/last-notifications-details', [NotificationController::class, 'lastNotificationDetails']); 
    Route::resource('/notifications', NotificationController::class);
    Route::get('/image', [ImageController::class, 'getImage']);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::delete('/logout', [SessionController::class, 'logout']); 
});

