from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
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
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))

def open_academic_year_form(driver):
    driver.get("http://localhost:8000/academicyears")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm năm học mới')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm năm học mới')]"))
    )

def fill_academic_year_form(driver, name, start, end, semesterCount):
    name_input = driver.find_element(By.ID, "name")
    start_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "startDate")))
    end_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "endDate")))

    # Remove readonly from date fields
    driver.execute_script("arguments[0].removeAttribute('readonly')", start_input)
    driver.execute_script("arguments[0].removeAttribute('readonly')", end_input)

    if name is not None:
        name_input.clear()
        name_input.send_keys(name)

    if start is not None:
        driver.execute_script("arguments[0].value = arguments[1];", start_input, start)

    if end is not None:
        driver.execute_script("arguments[0].value = arguments[1];", end_input, end)

    # Use Select for dropdown
    select = Select(driver.find_element(By.ID, "semesterCount"))
    select.select_by_visible_text(f"{semesterCount} học kỳ")

    # Click Save
    submit_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Lưu')]")
    driver.execute_script("arguments[0].click();", submit_btn)

# ========== Đánh giá lỗi ==========
def form_not_closed(driver):
    try:
        WebDriverWait(driver, 2).until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm năm học mới')]"))
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
        print(f"🔍 Exception: {e}")
        traceback.print_exc()
        filename = f"error_{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"📄 Giao diện lỗi được lưu vào: {filename}")
        test_results.append((name, False))

def test_missing_name(driver):
    open_academic_year_form(driver)
    fill_academic_year_form(driver, None, "2025-09-01", "2026-06-30", 1)
    assert expect_input_rejected(driver, "name")

def test_missing_start_date(driver):
    open_academic_year_form(driver)
    fill_academic_year_form(driver, "Năm học 2025", None, "2026-06-30", 1)
    assert expect_input_rejected(driver, "startDate")

def test_missing_end_date(driver):
    open_academic_year_form(driver)
    fill_academic_year_form(driver, "Năm học 2025", "2025-09-01", None, 1)
    assert expect_input_rejected(driver, "endDate")

def test_same_start_end_date(driver):
    open_academic_year_form(driver)
    fill_academic_year_form(driver, "Năm học 2025", "2025-09-01", "2025-09-01", 1)
    assert expect_input_rejected(driver, "endDate")

def test_start_after_end(driver):
    open_academic_year_form(driver)
    fill_academic_year_form(driver, "Năm học 2025", "2026-06-30", "2025-09-01", 1)
    assert expect_input_rejected(driver, "endDate")

def test_valid_input(driver):
    open_academic_year_form(driver)
    name = f"Năm học {random.randint(2025, 2030)}"
    fill_academic_year_form(driver, name, "2025-09-01", "2026-06-30", 1)
    # Kiểm tra nếu form đóng và entry mới xuất hiện
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{name}')]"))
    )

# ========== Main ==========
if __name__ == "__main__":
    driver = create_driver()
    try:
        login(driver)
        run_test("Thiếu tên năm học", driver, test_missing_name)
        run_test("Thiếu ngày bắt đầu", driver, test_missing_start_date)
        run_test("Thiếu ngày kết thúc", driver, test_missing_end_date)
        run_test("Ngày bắt đầu bằng ngày kết thúc", driver, test_same_start_end_date)
        run_test("Ngày bắt đầu sau ngày kết thúc", driver, test_start_after_end)
        run_test("Thêm năm học thành công", driver, test_valid_input)
    finally:
        driver.quit()

    # Kết quả
    passed = sum(1 for _, ok in test_results if ok)
    total = len(test_results)
    print("\n========== KẾT QUẢ ==========")
    for name, ok in test_results:
        print(f"{name}: {'✅ PASSED' if ok else '❌ FAILED'}")
    print(f"\n✅ Tổng: {passed}/{total} test PASSED")
