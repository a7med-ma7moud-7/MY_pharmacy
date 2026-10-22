<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
   public function user(){
    $user = User::all();
    return view('client.user', ['users' => $user]);
   }
  

   public function edit($id)
   {
       $user = User::findOrFail($id);
       return view('client.edit', ['user' => $user]);
   }

   public function update(StoreUserRequest $request, $id)
   {
       $user = User::findOrFail($id);
       $user->update($request->validated());
       
       if($request->filled('password')) {
           $user->password = Hash::make($request->password);
       }
       
       $user->save();
       
       return redirect()->route('users.index')->with('success', 'تم تحديث بيانات المستخدم بنجاح');
   }

   public function destroy($id)
   {
       $user = User::findOrFail($id);
       $user->delete();
       
       return redirect()->route('users.index')->with('success', 'تم حذف المستخدم بنجاح');
   }
}
