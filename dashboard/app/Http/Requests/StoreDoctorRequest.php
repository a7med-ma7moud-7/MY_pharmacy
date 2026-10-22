<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'specialty' => 'required|string|max:255',
            'price' => 'required',
            'number' => 'required',
            'location' => 'required|string|max:255',
            'tow_location' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
            'subscription' => 'required|in:subscribed,not_subscribed',
        ];
    }
}
