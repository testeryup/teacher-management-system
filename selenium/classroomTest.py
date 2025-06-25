from selenium import webdriver
import time  # cần để dùng time.sleep
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import traceback
import random
from datetime import datetime

# ========== Setup ==========
def create_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)

def login(driver):
    print("Đăng nhập...")
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))
    print("✅ Đăng nhập thành công")

def open_classroom_form(driver):
    print("Mở form Thêm lớp học...")
    driver.get("http://localhost:8000/classrooms")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm lớp học')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm lớp học mới')]"))
    )

def fill_classroom_form(driver, name, students=0):
    if name:
        driver.find_element(By.ID, "name").clear()
        driver.find_element(By.ID, "name").send_keys(name)

    dropdown_ids = ["semester_id", "course_id", "teacher_id"]
    for dropdown_id in dropdown_ids:
        element = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, dropdown_id)))
        element.click()
        for _ in range(10):
            element.send_keys(Keys.DOWN)
            time.sleep(0.1)
        element.send_keys(Keys.ENTER)

    students_input = driver.find_element(By.ID, "students")
    students_input.clear()
    students_input.send_keys(str(students))

    submit_btn = driver.find_element(By.XPATH, "//button[contains(.,'Thêm mới')]")
    driver.execute_script("arguments[0].click();", submit_btn)

def open_batch_classroom_form(driver):
    print("Mở form Thêm lớp học hàng loạt...")
    driver.get("http://localhost:8000/classrooms")
    batch_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm lớp học hàng loạt')]"))
    )
    driver.execute_script("arguments[0].click();", batch_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm lớp học hàng loạt')]"))
    )

def fill_batch_classroom_form(driver, prefix, count=1, students_per_class=30):
    # Tên ID của các dropdown <select>
    select_ids = ["bulk-course_id", "bulk-semester_id", "bulk-teacher_id"]

    for select_id in select_ids:
        select_elem = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, select_id)))
        options = select_elem.find_elements(By.TAG_NAME, "option")
        if len(options) > 1:
            last_value = options[-1].get_attribute("value")
            driver.execute_script(f"""
                const el = document.getElementById('{select_id}');
                el.value = '{last_value}';
                el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            """)
            time.sleep(0.2)

    # Nhập số lượng lớp học
    driver.execute_script("""
        const el = document.getElementById('bulk-number_of_classes');
        el.value = arguments[0];
        el.dispatchEvent(new Event('input', { bubbles: true }));
    """, str(count))

    # Nhập số học sinh mỗi lớp
    driver.execute_script("""
        const el = document.getElementById('bulk-students_per_class');
        el.value = arguments[0];
        el.dispatchEvent(new Event('input', { bubbles: true }));
    """, str(students_per_class))

    # Nhập tiền tố tên lớp
    driver.execute_script("""
        const el = document.getElementById('bulk-class_name_prefix');
        el.value = arguments[0];
        el.dispatchEvent(new Event('input', { bubbles: true }));
    """, prefix)

    # Click nút "Tạo 1 lớp học"
    submit_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
        (By.XPATH, "//button[@type='submit' and @form='bulk-classroom-form' and contains(text(), 'Tạo 1 lớp học')]")
    ))
    driver.execute_script("arguments[0].click();", submit_btn)


# ========== Check ==========
def form_not_closed(driver):
    try:
        WebDriverWait(driver, 2).until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm lớp học') or contains(.,'Thêm lớp học hàng loạt')]"))
        )
        return True
    except TimeoutException:
        return False

def input_invalid(driver, input_id):
    try:
        element = driver.find_element(By.ID, input_id)
        return "is-invalid" in element.get_attribute("class")
    except NoSuchElementException:
        return False

def expect_input_rejected(driver, input_id):
    return form_not_closed(driver) or input_invalid(driver, input_id)

# ========== Test Cases ==========
test_results = []

def run_test(name, driver, func):
    print(f"\n▶️ Bắt đầu test: {name}")
    try:
        func(driver)
        test_results.append((name, True))
        print(f"✅ {name}: PASSED")
    except Exception as e:
        print(f"❌ {name}: FAILED")
        print(f"🔍 Exception: {str(e)}")
        traceback.print_exc()
        filename = f"error_{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"📄 Giao diện lỗi được lưu vào: {filename}")
        test_results.append((name, False))

def test_missing_name(driver):
    open_classroom_form(driver)
    fill_classroom_form(driver, None, students=30)
    assert expect_input_rejected(driver, "name")

def test_invalid_students(driver):
    open_classroom_form(driver)
    fill_classroom_form(driver, "Lớp sai số", students=-5)
    assert expect_input_rejected(driver, "students")

def test_valid_classroom(driver):
    open_classroom_form(driver)
    name = f"LH{random.randint(1000,9999)}"
    fill_classroom_form(driver, name, students=35)
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{name}')]"))
    )

def test_missing_prefix_batch(driver):
    open_batch_classroom_form(driver)
    fill_batch_classroom_form(driver, prefix="", count=1, students_per_class=30)
    assert expect_input_rejected(driver, "batch_prefix")

def test_invalid_students_batch(driver):
    open_batch_classroom_form(driver)
    fill_batch_classroom_form(driver, prefix="LH", count=1, students_per_class=-10)
    assert expect_input_rejected(driver, "batch_students")

def test_valid_batch_classroom(driver):
    open_batch_classroom_form(driver)
    prefix = f"TEST{random.randint(1000,9999)}"
    fill_batch_classroom_form(driver, prefix=prefix, count=1, students_per_class=25)

    # Chờ quá trình xử lý (nếu có loading)
    time.sleep(1)

    # Làm mới trang để đảm bảo hiển thị lớp mới tạo
    driver.refresh()

    # Đợi bảng lớp học render lại
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{prefix}')]"))
    )


# ========== Main ==========
if __name__ == "__main__":
    driver = create_driver()
    try:
        login(driver)
        run_test("Thiếu tên lớp học", driver, test_missing_name)
        run_test("Số học sinh không hợp lệ", driver, test_invalid_students)
        run_test("Thêm lớp học hợp lệ", driver, test_valid_classroom)

        run_test("Thiếu tiền tố tên lớp (batch)", driver, test_missing_prefix_batch)
        run_test("Số học sinh mỗi lớp không hợp lệ (batch)", driver, test_invalid_students_batch)
        run_test("Thêm lớp học hàng loạt hợp lệ", driver, test_valid_batch_classroom)
    finally:
        driver.quit()

    print("\n========== KẾT QUẢ classroomTest ==========")
    for name, ok in test_results:
        print(f"{name}: {'✅ PASSED' if ok else '❌ FAILED'}")
    print(f"✅ Tổng: {sum(1 for _, ok in test_results if ok)}/{len(test_results)} test PASSED")
