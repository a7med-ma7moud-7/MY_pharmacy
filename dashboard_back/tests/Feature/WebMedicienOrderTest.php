<?php

namespace Tests\Feature;

use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WebMedicienOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_order_creates_order_items_updates_stock_and_notifies_admins(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $regularUser = User::factory()->create(['role' => 'user']);

        $medicine = Medicien::create([
            'name' => 'Paracetamol',
            'image' => 'paracetamol.png',
            'propose' => 'Pain relief',
            'price' => '50',
            'type' => 'tablet',
            'count' => '10',
        ]);

        $payload = [
            'cart_items' => json_encode([[
                'id' => $medicine->id,
                'quantity' => 2,
                'price' => 50,
                'total' => 100,
            ]]),
            'customer_name' => 'Test Customer',
            'customer_phone' => '01000000000',
            'customer_email' => 'customer@example.com',
            'address' => 'Cairo, Egypt',
            'delivery_method' => 'delivery',
            'notes' => 'Leave at the door',
        ];

        $response = $this->postJson(route('orders.store'), $payload);

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Test Customer',
            'customer_phone' => '01000000000',
            'status' => 'pending',
            'total_price' => 100,
        ]);

        $order = Order::firstOrFail();

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => 2,
            'price' => 50,
            'total' => 100,
        ]);

        $medicine->refresh();
        $this->assertSame('8', (string) $medicine->count);

        Notification::assertSentTo($admin, NewOrderNotification::class);
        Notification::assertNotSentTo($regularUser, NewOrderNotification::class);

        $this->assertSame(1, OrderItem::count());
    }

    public function test_store_order_returns_400_when_stock_is_insufficient(): void
    {
        $medicine = Medicien::create([
            'name' => 'Amoxicillin',
            'image' => 'amoxicillin.png',
            'propose' => 'Antibiotic',
            'price' => '70',
            'type' => 'capsule',
            'count' => '1',
        ]);

        $payload = [
            'cart_items' => json_encode([[
                'id' => $medicine->id,
                'quantity' => 2,
                'price' => 70,
                'total' => 140,
            ]]),
            'customer_name' => 'Low Stock',
            'customer_phone' => '01111111111',
            'address' => 'Giza, Egypt',
            'delivery_method' => 'pickup',
        ];

        $response = $this->postJson(route('orders.store'), $payload);

        $response->assertStatus(400)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('order_items', 0);
    }

    public function test_store_order_validates_required_fields(): void
    {
        $response = $this->postJson(route('orders.store'), [
            'customer_name' => 'Missing Cart',
            'customer_phone' => '01234567890',
            'address' => 'Mansoura, Egypt',
            'delivery_method' => 'invalid-method',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cart_items', 'delivery_method']);
    }
}
