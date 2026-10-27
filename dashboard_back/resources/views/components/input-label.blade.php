@props(['value' => '', 'for'])

<label for="{{ $for }}" {{ $attributes->merge(['class' => 'form-label']) }}>
    {{ $value ?? $slot }}
</label>
