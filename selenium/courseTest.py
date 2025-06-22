from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import random
import traceback
from datetime import datetime

# ========== Setup ==========
def create_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)

def login(driver):
    print("Đang đăng nhập...")
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))
    print("✅ Đăng nhập thành công.")

def open_course_form(driver):
    print("Mở form Thêm môn học...")
    driver.get("http://localhost:8000/courses")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm môn học mới')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm môn học mới')]"))
    )
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "name")))

def fill_course_form(driver, name, credits, lessons, coefficient, dept_index=None):
    print(f"Điền form: name={name}, credits={credits}, lessons={lessons}, coef={coefficient}")
    if name is not None:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "name"))).clear()
        driver.find_element(By.ID, "name").send_keys(name)

    if credits is not None:
        input_credits = driver.find_element(By.ID, "credits")
        input_credits.clear()
        input_credits.send_keys(str(credits))

    if lessons is not None:
        input_lessons = driver.find_element(By.ID, "lessons")
        input_lessons.clear()
        input_lessons.send_keys(str(lessons))

    if coefficient is not None:
        input_coef = driver.find_element(By.ID, "course_coefficient")
        input_coef.clear()
        input_coef.send_keys(str(coefficient))

    if dept_index is not None:
        dept_select = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "department_id")))
        dept_select.click()
        for _ in range(dept_index):
            dept_select.send_keys(Keys.DOWN)
        dept_select.send_keys(Keys.ENTER)

    submit_btn = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm mới')]"))
    )
    driver.execute_script("arguments[0].click();", submit_btn)

# ========== Kiểm tra kết quả ==========
def form_not_closed(driver):
    try:
        WebDriverWait(driver, 2).until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm môn học mới')]"))
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
        print(f"🔍 Raw: {repr(e)}")
        traceback.print_exc()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"error_{name.replace(' ', '_')}_{timestamp}.html"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"📄 Giao diện lỗi được lưu vào: {filename}")
        test_results.append((name, False))

def test_missing_name(driver):
    open_course_form(driver)
    fill_course_form(driver, None, 3, 30, 1.2, 1)
    assert expect_input_rejected(driver, "name")

def test_duplicate_name(driver):
    open_course_form(driver)
    fill_course_form(driver, "Lập trình C", 3, 30, 1.2, 1)
    assert expect_input_rejected(driver, "name")

def test_invalid_coefficient(driver):
    open_course_form(driver)
    fill_course_form(driver, "Môn hệ số sai", 3, 30, 2.0, 1)
    assert expect_input_rejected(driver, "course_coefficient")

def test_missing_credits(driver):
    open_course_form(driver)
    fill_course_form(driver, "Thiếu tín chỉ", None, 30, 1.2, 1)
    assert expect_input_rejected(driver, "credits")

def test_missing_lessons(driver):
    open_course_form(driver)
    fill_course_form(driver, "Thiếu số tiết", 3, None, 1.2, 1)
    assert expect_input_rejected(driver, "lessons")

def test_valid_course_add(driver):
    open_course_form(driver)
    name = f"Môn học {random.randint(1000, 9999)}"
    fill_course_form(driver, name, 3, 30, 1.2, 1)
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{name}')]"))
    )

# ========== Main ==========
if __name__ == "__main__":
    driver = create_driver()
    try:
        login(driver)
        run_test("Thiếu tên môn học", driver, test_missing_name)
        run_test("Tên môn học trùng", driver, test_duplicate_name)
        run_test("Hệ số sai", driver, test_invalid_coefficient)
        run_test("Thiếu tín chỉ", driver, test_missing_credits)
        run_test("Thiếu số tiết", driver, test_missing_lessons)
        run_test("Thêm môn học hợp lệ", driver, test_valid_course_add)
    finally:
        driver.quit()

    # Tổng kết
    passed = sum(1 for _, ok in test_results if ok)
    total = len(test_results)
    print("\n========== KẾT QUẢ courseTest ==========")
    for name, ok in test_results:
        print(f"{name}: {'✅ PASSED' if ok else '❌ FAILED'}")
    print(f"\n✅ Tổng: {passed}/{total} test PASSED")
