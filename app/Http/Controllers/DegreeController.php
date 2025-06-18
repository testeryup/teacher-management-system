<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Degree;
use Illuminate\Validation\Rule;

class DegreeController extends Controller
{
    public function index(){
        $degrees = Degree::paginate(10);
        return Inertia::render('Degrees/Index', ['degrees' => $degrees]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:degrees,name' // FIX: Check duplicate name
                ],
                'baseSalaryFactor' => [
                    'required',
                    'numeric',
                    'min:0.1', // FIX: Must be > 0
                    'max:5.0'  // FIX: Add reasonable upper limit
                ],
            ], [
                // FIX: Custom error messages in Vietnamese
                'name.required' => 'Tên bằng cấp là bắt buộc',
                'name.unique' => 'Tên bằng cấp này đã tồn tại',
                'name.max' => 'Tên bằng cấp không được vượt quá 255 ký tự',
                'baseSalaryFactor.required' => 'Hệ số lương là bắt buộc',
                'baseSalaryFactor.numeric' => 'Hệ số lương phải là số',
                'baseSalaryFactor.min' => 'Hệ số lương phải lớn hơn 0',
                'baseSalaryFactor.max' => 'Hệ số lương không được vượt quá 5.0',
            ]);
            
            Degree::create($validated);
            
            return redirect()->route('degrees.index')
                ->with('message', 'Bằng cấp đã được thêm thành công');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể tạo bằng cấp: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, Degree $degree)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('degrees', 'name')->ignore($degree->id) // FIX: Ignore current record
                ],
                'baseSalaryFactor' => [
                    'required',
                    'numeric',
                    'min:0.1', // FIX: Must be > 0
                    'max:5.0'
                ],
            ], [
                // FIX: Custom error messages
                'name.required' => 'Tên bằng cấp là bắt buộc',
                'name.unique' => 'Tên bằng cấp này đã tồn tại',
                'name.max' => 'Tên bằng cấp không được vượt quá 255 ký tự',
                'baseSalaryFactor.required' => 'Hệ số lương là bắt buộc',
                'baseSalaryFactor.numeric' => 'Hệ số lương phải là số',
                'baseSalaryFactor.min' => 'Hệ số lương phải lớn hơn 0',
                'baseSalaryFactor.max' => 'Hệ số lương không được vượt quá 5.0',
            ]);

            $degree->update($validated);
            
            return redirect()->route('degrees.index')
                ->with('message', 'Chỉnh sửa bằng cấp thành công');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể cập nhật bằng cấp: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Degree $degree)
    {
        try {
            // Check if any teachers are using this degree
            if ($degree->teachers()->count() > 0) {
                return back()->withErrors([
                    'reference' => 'Không thể xóa bằng cấp này vì đang được sử dụng bởi ' . 
                        $degree->teachers()->count() . ' giáo viên'
                ]);
            }

            $degree->delete();
            return redirect()->route('degrees.index')
                ->with('message', 'Xóa bằng cấp thành công');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể xóa bằng cấp: ' . $e->getMessage());
        }
    }
}