<x-user-layout>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white fw-bold">
                        <i class="fas fa-robot me-2"></i>مساعد الذكاء الاصطناعي الطبي
                    </div>
                    <div class="card-body">
                        <form id="ai-form" class="mb-3">
                            <div class="input-group">
                                <input type="text" name="question" class="form-control" placeholder="اسأل عن أي شيء طبي..." required>
                                <button type="submit" class="btn btn-primary">اسأل</button>
                            </div>
                        </form>
                        <div id="ai-answer" class="alert alert-info d-none"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
    document.getElementById('ai-form').onsubmit = async function(e) {
        e.preventDefault();
        let question = this.question.value;
        let answerDiv = document.getElementById('ai-answer');
        answerDiv.classList.add('d-none');
        answerDiv.innerText = 'جاري التحميل...';
        answerDiv.classList.remove('alert-danger');
        try {
            let res = await fetch("{{ route('ai.ask') }}", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({question})
            });
            console.log('Request URL:', "{{ route('ai.ask') }}");
            console.log('Request method: POST');
            console.log('Request body:', JSON.stringify({question}));
            console.log('CSRF Token:', "{{ csrf_token() }}");
            
            console.log('Response status:', res.status);
            console.log('Response headers:', res.headers);
            
            const responseText = await res.text();
            console.log('Raw response:', responseText.substring(0, 200));
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse error:', e);
                console.error('Response was:', responseText.substring(0, 500));
                answerDiv.innerText = 'Error: Invalid response from server';
                answerDiv.classList.remove('d-none');
                answerDiv.classList.add('alert-danger');
                return;
            }
            
            console.log('Response data:', data);
            answerDiv.innerText = data.answer;
            answerDiv.classList.remove('d-none');
        } catch (err) {
            console.error('AI Chat Error:', err);
            answerDiv.innerText = 'Error: ' + err.message;
            answerDiv.classList.remove('d-none');
            answerDiv.classList.add('alert-danger');
        }
    };
    </script>
</x-user-layout> 