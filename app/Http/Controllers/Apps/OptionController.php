<?php

namespace App\Http\Controllers\Apps;

use App\Models\Order;
use App\Models\Stock;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use App\Models\ExpenseSubcategory;
use App\Http\Controllers\Controller;

class OptionController extends Controller
{
    public function getCoupon(Request $request)
    {
        // get coupon by request
        $coupon = Coupon::where('code', $request->code)->where('is_active', 1)->first();

        // failed get coupon
        if (!$coupon) {
            return response()->json([
                'message' => 'Kupon tidak ditemukan',
                'code' => 404,
                'data' => null
            ], 404);
        }

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => $coupon
        ]);
    }

    public function getOrders(Supplier $supplier)
    {
        // get all order by supplier
        $orders = Order::where('supplier_id', $supplier->id)->get();

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => $orders
        ]);
    }

    public function getTransactions($id)
    {
        if($id != 0){
            // get customer by id
            $customer = Customer::findOrFail($id);
            // get all transaction by customer
            $transactions = Transaction::where('customer_id', $customer->id)->get();
        }else{
            $transactions = Transaction::whereNull('customer_id')->get();
        }

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => $transactions
        ]);
    }

    public function getOrderDetails(Order $order)
    {
        // load relation
        $order->load('order_payments');

        // check order payments
        if($order->order_payments != 'paid')
            $total_payments = $order->grand_total - $order->order_payments()->sum('amount');

        // get order details
        $orderDetails = $order->order_details()->with([
            'order',
            'items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
        ])->get()->map(function($detail){
            $detail->total_price = $detail->quantity * $detail->price;
            $detail->formated_price = number_format($detail->price, '0');
            $detail->unit = $detail->items->unit->name;

            return $detail;
        });

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => [
                'order_details' => $orderDetails,
                'order' => $order,
                'order_payment' => $total_payments
            ]
        ]);
    }

    public function getTransactionDetails(Transaction $transaction)
    {
        // load relation
        $transaction->load('transaction_details');

        // // check order payments
        // if($transaction->order_payments != 'paid')
        //     $total_payments = $order->grand_total - $order->order_payments()->sum('amount');

        // get transaction details
        $transactionDetails = $transaction->transaction_details()
            ->with([
                'transaction',
                'items' => function ($morphTo) {
                    $morphTo->morphWith([
                        \App\Models\ProductVariant::class => [
                            'product',
                            'unit',
                            'product_variant_values',
                            'product_variant_values.variant_value',
                            'product_variant_values.variant_value.variant_option'
                        ],
                        \App\Models\Menu::class => [
                            'category'
                        ],
                        \App\Models\DiscountPackage::class => [
                            'discount_package_items.items' => function ($morphTo) {
                                $morphTo->morphWith([
                                    \App\Models\ProductVariant::class => [
                                        'product',
                                        'unit',
                                        'product_variant_values',
                                        'product_variant_values.variant_value',
                                        'product_variant_values.variant_value.variant_option'
                                    ],
                                    \App\Models\Material::class => [
                                        'unit'
                                    ]
                                ]);
                            }
                        ]
                    ]);
                },
            ])
            ->get()
            ->map(function ($detail) {
                $detail->total_price = $detail->quantity * $detail->price;
                $detail->formated_price = number_format($detail->price, 0);
                // kalau mau ambil unit: $detail->unit = optional($detail->items->unit)->name;

                return $detail;
            });


        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => [
                'transaction_details' => $transactionDetails,
                'transaction' => $transaction,
            ]
        ]);
    }

    public function getStocks(Request $request)
    {
        // get request item id
        $itemId = $request->item;

        // get request date
        $date = $request->date;

        // get request type
        $type = $request->type;

        if ($type == 'products')
            $model = \App\Models\ProductVariant::class;
        else
            $model = \App\Models\Material::class;

        // get stock by request
        $availableStock = Stock::getAvailableStockUntilDate($model, $itemId, $date);

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => $availableStock
        ]);
    }

    public function getExpenseSubcategories(ExpenseCategory $expense_category)
    {
        // get all expense subcategory by expense category
        $expense_subcategories = ExpenseSubcategory::where('expense_category_id', $expense_category->id)->get();

        // send json response
        return response()->json([
            'message' => 'Data berhasil Ditemukan',
            'code' => 200,
            'data' => $expense_subcategories
        ]);
    }

    public function getLastTransaction(Request $request)
    {
        $data = Transaction::query()
            ->with(['table', 'bank_account', 'customer', 'transaction_taxs', 'cashier_shift.user', 'transaction_details' => function($query){
                $query->with([
                    'items' => function ($morphTo) {
                        $morphTo->morphWith([
                            \App\Models\ProductVariant::class => [
                                'product',
                                'unit',
                                'product_variant_values',
                                'product_variant_values.variant_value',
                                'product_variant_values.variant_value.variant_option'
                            ],
                            \App\Models\Menu::class => [
                                'category'
                            ],
                            \App\Models\DiscountPackage::class => [
                                'discount_package_items.items' => function ($morphTo) {
                                    $morphTo->morphWith([
                                        \App\Models\ProductVariant::class => [
                                            'product',
                                            'unit',
                                            'product_variant_values',
                                            'product_variant_values.variant_value',
                                            'product_variant_values.variant_value.variant_option'
                                        ],
                                        \App\Models\Material::class => [
                                            'unit'
                                        ]
                                    ]);
                                }
                            ]
                        ]);
                    },
                ]);
            },
            ])->latest()->first();

        $data->paid = $data->pay;
        $data->return = $data->change;
        $data->pay = number_format($data->pay, 0);
        $data->change = number_format($data->change, 0);

        return response()->json([
            'message' => 'Data berhasil ditemukan',
            'code' => 200,
            'data' => $data
        ]);
    }
}
