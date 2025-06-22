from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import random
import time

# ========== Driver Setup ==========
def create_driver():
    options = Options()
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument("--start-maximized")
    return webdriver.Chrome(options=options)

# ========== Login ==========
def login(driver):
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))

# ========== Mở form ==========
def open_department_form(driver):
    driver.get("http://localhost:8000/departments")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm khoa mới')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm khoa mới')]"))
    )

# ========== Gửi form ==========
def fill_and_submit_form(driver, name, abbr):
    WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "name"))).send_keys(name)
    driver.find_element(By.ID, "abbrName").send_keys(abbr)
    driver.find_element(By.XPATH, "//button[contains(.,'Thêm mới')]").click()

# ========== Kiểm tra lỗi ==========
def has_error(driver, message):
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{message}')]"))
        )
        return True
    except TimeoutException:
        return False

# ========== Test case logic ==========
def test_case(driver, title, name, abbr, expected_error):
    try:
        open_department_form(driver)
        fill_and_submit_form(driver, name, abbr)
        if expected_error:
            return has_error(driver, expected_error)
        else:
            WebDriverWait(driver, 5).until(
                EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Thêm khoa mới thành công")
            )
            return True
    except:
        return False

# ========== Run all tests ==========
if __name__ == "__main__":
    tests = [
        ("Test missing name", "", "MNC", "Tên khoa là bắt buộc"),
        ("Test missing abbrName", "Công nghệ thông tin", "", "Tên viết tắt là bắt buộc"),
        ("Test duplicate name", "Công nghệ thông tin", "DH1", "Thêm khoa mới thất bại"),
        ("Test duplicate abbrName", "Khoa A", "CNTT", "Thêm khoa mới thất bại"),
        ("Test valid department", f"Khoa Test {random.randint(1000,9999)}", f"KT{random.randint(10,99)}", None)
    ]

    driver = create_driver()
    passed = 0
    try:
        login(driver)
        for title, name, abbr, expected in tests:
            result = test_case(driver, title, name, abbr, expected)
            if result:
                print(f"✅ {title}: PASSED")
                passed += 1
            else:
                print(f"❌ {title}: FAILED")
            time.sleep(1)
        print(f"\n✅ Tổng kết: {passed}/{len(tests)} test PASSED")
    finally:
        driver.quit()
