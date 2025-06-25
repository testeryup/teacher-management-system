from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import random

# ========== Setup ==========
def create_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)

def login(driver):
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))

def open_teacher_form(driver):
    driver.get("http://localhost:8000/teachers")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm giáo viên mới')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm giáo viên mới')]"))
    )

def fill_teacher_form(driver, fullName, dob, phone, email, degree_index=None, dept_index=None):
    if fullName is not None:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "fullName"))).clear()
        driver.find_element(By.ID, "fullName").send_keys(fullName)

    if dob is not None:
        driver.execute_script(f"document.getElementById('DOB').value = '{dob}';")

    if phone is not None:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "phone"))).clear()
        driver.find_element(By.ID, "phone").send_keys(phone)

    if email is not None:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "email"))).clear()
        driver.find_element(By.ID, "email").send_keys(email)

    if degree_index is not None:
        degree_select = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.ID, "degree_id")))
        degree_select.click()
        for _ in range(degree_index):
            degree_select.send_keys(Keys.DOWN)
        degree_select.send_keys(Keys.ENTER)

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

def expect_error(driver, message):
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{message}')]"))
        )
        return True
    except TimeoutException:
        return False

# ========== Test Cases ==========
test_results = []

def run_test(name, driver, func):
    try:
        func(driver)
        test_results.append((name, True))
    except Exception as e:
        print(f"\n❌ Lỗi ở {name}: {e}")
        test_results.append((name, False))
        with open("error_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)

def test_missing_fullName(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, None, "1990-01-01", "0912345678", "t1234@gmail.com", 1, 1)
    assert expect_error(driver, "Họ tên là bắt buộc")

def test_missing_dob(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van A", None, "0912345678", "t1235@gmail.com", 1, 1)
    assert expect_error(driver, "Thêm giáo viên mới thất bại")

def test_missing_phone(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van B", "1990-01-01", None, "t1236@gmail.com", 1, 1)
    assert expect_error(driver, "Số điện thoại chỉ được chứa số")

def test_missing_email(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van C", "1990-01-01", "0912345678", None, 1, 1)
    assert expect_error(driver, "Email không hợp lệ")

def test_missing_degree(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van D", "1990-01-01", "0912345678", "t1237@gmail.com", None, 1)
    assert expect_error(driver, "Bằng cấp là bắt buộc")

def test_missing_department(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van E", "1990-01-01", "0912345678", "t1238@gmail.com", 1, None)
    assert expect_error(driver, "Khoa là bắt buộc")

def test_duplicate_phone(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van F", "1990-01-01", "0977642678", f"t{random.randint(1000,9999)}@gmail.com", 1, 1)
    assert expect_error(driver, "Số điện thoại này đã được sử dụng")

def test_duplicate_email(driver):
    open_teacher_form(driver)
    fill_teacher_form(driver, "Nguyen Van G", "1990-01-01", str(random.randint(1000000000, 9999999999)), "22010179@st.phenikaa-uni.edu.vn	", 1, 1)
    assert expect_error(driver, "Email này đã được sử dụng")

def test_add_teacher_success(driver):
    open_teacher_form(driver)
    fill_teacher_form(
        driver,
        "GV " + str(random.randint(1000, 9999)),
        "1990-01-01",
        str(random.randint(1000000000, 9999999999)),
        f"t{random.randint(1000, 9999)}@gmail.com",
        1,
        1
    )
    assert WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Thêm giáo viên mới thành công')]"))
    )

# ========== Main ==========
if __name__ == "__main__":
    driver = create_driver()
    try:
        login(driver)
        run_test("Thiếu họ tên", driver, test_missing_fullName)
        run_test("Thiếu ngày sinh", driver, test_missing_dob)
        run_test("Thiếu số điện thoại", driver, test_missing_phone)
        run_test("Thiếu email", driver, test_missing_email)
        run_test("Chưa chọn bằng cấp", driver, test_missing_degree)
        run_test("Chưa chọn khoa", driver, test_missing_department)
        run_test("Số điện thoại trùng", driver, test_duplicate_phone)
        run_test("Email trùng", driver, test_duplicate_email)
        run_test("Thêm giáo viên thành công", driver, test_add_teacher_success)
    finally:
        driver.quit()

    # Kết quả
    passed = sum(1 for _, ok in test_results if ok)
    total = len(test_results)
    print("\n========== KẾT QUẢ teacherTest ==========")
    for name, ok in test_results:
        print(f"{name}: {'✅ PASSED' if ok else '❌ FAILED'}")
    print(f"\n✅ Tổng: {passed}/{total} test PASSED")
