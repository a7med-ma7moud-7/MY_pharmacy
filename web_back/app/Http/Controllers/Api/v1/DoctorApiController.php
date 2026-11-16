<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Rating;
use App\Models\TreatedCase;
use App\Models\User;
use App\Services\DoctorPatientAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorApiController extends Controller
{
    public function __construct(
        private readonly DoctorPatientAccessService $accessService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $this->resolvePerPage($request, default: 9, max: 100);

        $doctors = Doctor::query()
            ->activeAndSubscribed()
            ->filter($request->only(['search', 'specialty', 'location', 'tow_location']))
            ->withAvg(['visibleRatings as ratings_avg'], 'rating')
            ->withCount([
                'visibleRatings as ratings_count',
                'publishedTreatedCases as treated_cases_count',
            ])
            ->sortBy($request->query('sort'))
            ->paginate($perPage);

        $doctors->getCollection()->transform(function (Doctor $doctor) {
            $count = (int) ($doctor->ratings_count ?? 0);
            $doctor->average_rating = $count > 0 ? round((float) $doctor->ratings_avg, 1) : 0.0;
            $doctor->ratings_count = $count;
            $doctor->image_url = $doctor->image_url;
            return $doctor;
        });

        return $this->successResponse([
            'data' => $doctors,
            'filters' => Doctor::getFilterOptions(),
        ]);
    }

    public function show($id): JsonResponse
    {
        $doctor = Doctor::activeAndSubscribed()->findOrFail($id);

        $ratings = $doctor->visibleRatings()
            ->with('user:id,name,avatar')
            ->latest()
            ->get();

        $ratingsCount = $ratings->count();
        $averageRating = $ratingsCount > 0 ? round((float) $ratings->avg('rating'), 1) : 0.0;

        $treatedCases = $doctor->publishedTreatedCases()
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();

        $doctor->setRelation('ratings', $ratings);
        $doctor->average_rating = $averageRating;
        $doctor->ratings_count = $ratingsCount;
        $doctor->appendResolvedImages();

        $viewerEligibility = [
            'authenticated' => false,
            'can_chat' => false,
            'can_review' => false,
            'eligible_appointments' => [],
        ];

        if (Auth::check()) {
            /** @var User $viewer */
            $viewer = Auth::user();
            $canChat = $viewer->isUser() && $this->accessService->canPatientChatWithDoctor($viewer, (int) $doctor->id);

            $reviewedApptIds = Rating::query()
                ->where('doctor_id', $doctor->id)
                ->where('user_id', $viewer->id)
                ->whereNotNull('appointment_id')
                ->pluck('appointment_id')
                ->all();

            $eligibleReviewAppointments = $viewer->isUser()
                ? $this->accessService
                    ->appointmentsBetweenUserAndDoctor($viewer, (int) $doctor->id)
                    ->where('status', 'completed')
                    ->when($reviewedApptIds !== [], fn ($q) => $q->whereNotIn('id', $reviewedApptIds))
                    ->orderByDesc('appointment_date')
                    ->get(['id', 'appointment_date', 'appointment_time', 'status'])
                : collect();

            $viewerEligibility = [
                'authenticated' => true,
                'can_chat' => $canChat,
                'can_review' => $eligibleReviewAppointments->isNotEmpty(),
                'eligible_appointments' => $eligibleReviewAppointments,
            ];
        }

        return $this->successResponse([
            'data' => [
                'doctor' => $doctor,
                'ratings' => $ratings,
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount,
                'treated_cases' => $treatedCases,
                'viewer_eligibility' => $viewerEligibility,
            ],
        ]);
    }

    public function showCase($doctorId, $caseId): JsonResponse
    {
        $doctor = Doctor::activeAndSubscribed()->findOrFail($doctorId);
        $case = TreatedCase::query()
            ->where('doctor_id', $doctor->id)
            ->published()
            ->findOrFail($caseId);

        return $this->successResponse([
            'data' => $case,
        ]);
    }
}
