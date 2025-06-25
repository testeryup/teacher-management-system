from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import random
import time

# ====================== Setup ======================
def create_driver():
    options = Options()
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument("--start-maximized")
    return webdriver.Chrome(options=options)

def login(driver):
    driver.get("http://localhost:8000/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys("alex@alex.com")
    driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)
    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))

def open_degree_form(driver):
    driver.get("http://localhost:8000/degrees")
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Thêm bằng cấp mới')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(.,'Thêm bằng cấp mới')]"))
    )

def fill_and_submit_form(driver, name, salary):
    name_input = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "name")))
    salary_input = driver.find_element(By.ID, "baseSalaryFactor")
    submit_btn = driver.find_element(By.XPATH, "//button[contains(.,'Thêm mới')]")
    name_input.clear()
    name_input.send_keys(name)
    salary_input.clear()
    salary_input.send_keys(str(salary))
    submit_btn.click()

# ====================== Test Cases ======================
def run_test_case(driver, name, func):
    try:
        func(driver)
        print(f"✅ {name}: PASSED")
        return True
    except Exception:
        print(f"❌ {name}: FAILED")
        with open("error_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        return False

def test_missing_name(driver):
    open_degree_form(driver)
    fill_and_submit_form(driver, "", 1.5)
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Tên bằng cấp là bắt buộc')]"))
    )

def test_invalid_salary(driver):
    open_degree_form(driver)
    fill_and_submit_form(driver, "Không hợp lệ", 0)
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Hệ số lương phải lớn hơn 0')]"))
    )

def test_duplicate_name(driver):
    open_degree_form(driver)
    fill_and_submit_form(driver, "Đại học", 1.8)
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Thêm bằng cấp mới thất bại')]"))
    )

def test_valid_degree(driver):
    open_degree_form(driver)
    name = "Test " + str(random.randint(1000, 9999))
    fill_and_submit_form(driver, name, 2.0)
    WebDriverWait(driver, 5).until(
        EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Thêm bằng cấp mới thành công")
    )

# ====================== Main ======================
if __name__ == "__main__":
    test_cases = [
        ("Test missing name", test_missing_name),
        ("Test invalid salary", test_invalid_salary),
        ("Test duplicate name", test_duplicate_name),
        ("Test valid degree", test_valid_degree),
    ]

    driver = create_driver()
    passed = 0
    try:
        login(driver)
        for name, func in test_cases:
            if run_test_case(driver, name, func):
                passed += 1
    finally:
        driver.quit()
        print(f"\n✅ Kết quả: {passed} / {len(test_cases)} test passed")
