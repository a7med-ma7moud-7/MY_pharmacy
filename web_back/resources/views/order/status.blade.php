@extends('layouts.user')

@section('title', 'تحقق من حالة الطلب')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0 text-center">تحقق من حالة الطلب</h3>
                </div>
                <div class="card-body">
                    <div class="alert alert-info text-center">
                        يرجى إدخال رقم الطلب للتحقق من حالته
                    </div>
                    
                    <form id="checkOrderForm" class="mb-4">
                        <div class="form-group mb-3">
                            <label for="order_id" class="form-label">رقم الطلب</label>
                            <input type="number" class="form-control" id="order_id" name="order_id" required>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">التحقق من الحالة</button>
                        </div>
                    </form>
                    
                    <div id="orderResult" class="d-none">
                        <div class="alert alert-success">
                            <h5 class="text-center">معلومات الطلب</h5>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>رقم الطلب:</strong> <span id="orderId"></span></p>
                                    <p><strong>اسم العميل:</strong> <span id="customerName"></span></p>
                                    <p><strong>الهاتف:</strong> <span id="customerPhone"></span></p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>التاريخ:</strong> <span id="orderDate"></span></p>
                                    <p><strong>إجمالي الطلب:</strong> <span id="orderTotal"></span></p>
                                    <p><strong>حالة الطلب:</strong> <span id="orderStatus"></span></p>
                                </div>
                            </div>
                        </div>
                        
                        <h5 class="mt-4 mb-3">تفاصيل الطلب</h5>
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered">
                                <thead class="table-primary">
                                    <tr>
                                        <th>المنتج</th>
                                        <th>الكمية</th>
                                        <th>السعر</th>
                                        <th>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody id="orderItems">
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div id="orderError" class="alert alert-danger text-center d-none">
                        لم يتم العثور على طلب بهذا الرقم
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const checkOrderForm = document.getElementById('checkOrderForm');
        const orderResult = document.getElementById('orderResult');
        const orderError = document.getElementById('orderError');
        
        checkOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(checkOrderForm);
            
            // Reset display
            orderResult.classList.add('d-none');
            orderError.classList.add('d-none');
            
            fetch('/orders/check', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    orderError.textContent = data.error;
                    orderError.classList.remove('d-none');
                    return;
                }
                
                // Fill order details
                document.getElementById('orderId').textContent = data.order.id;
                document.getElementById('customerName').textContent = data.order.customer_name;
                document.getElementById('customerPhone').textContent = data.order.customer_phone;
                document.getElementById('orderDate').textContent = new Date(data.order.created_at).toLocaleDateString('ar-EG');
                document.getElementById('orderTotal').textContent = data.order.total_price + ' جنيه';
                
                // Translate status
                let status = '';
                switch(data.order.status) {
                    case 'pending':
                        status = 'قيد الانتظار';
                        break;
                    case 'processing':
                        status = 'جاري التحضير';
                        break;
                    case 'shipped':
                        status = 'تم الشحن';
                        break;
                    case 'delivered':
                        status = 'تم التسليم';
                        break;
                    case 'cancelled':
                        status = 'ملغي';
                        break;
                    default:
                        status = data.order.status;
                }
                document.getElementById('orderStatus').textContent = status;
                
                // Fill items table
                const orderItems = document.getElementById('orderItems');
                orderItems.innerHTML = '';
                
                data.items.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.medicine.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price} جنيه</td>
                        <td>${item.total} جنيه</td>
                    `;
                    orderItems.appendChild(row);
                });
                
                orderResult.classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error:', error);
                orderError.textContent = 'حدث خطأ أثناء التحقق من الطلب';
                orderError.classList.remove('d-none');
            });
        });
    });
</script>
@endsection 