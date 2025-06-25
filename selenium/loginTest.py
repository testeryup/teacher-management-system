from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ✅ Hàm khởi tạo WebDriver chung có tắt log
def create_driver():
    options = Options()
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)

# ✅ Test đăng nhập thành công
def test_login_success():
    driver = create_driver()
    try:
        driver.get("http://localhost:8000/login")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))

        driver.find_element(By.ID, "email").send_keys("alex@alex.com")
        driver.find_element(By.ID, "password").send_keys("12345678" + Keys.ENTER)

        WebDriverWait(driver, 10).until(EC.url_changes("http://localhost:8000/login"))
        assert "/login" not in driver.current_url
        print("✅ Login Success Test: PASSED")

    except Exception as e:
        print("❌ Login Success Test: FAILED", str(e))
    finally:
        driver.quit()
        
# ✅ Test không nhập email và mật khẩu
def test_empty_fields_validation():
    driver = create_driver()
    try:
        driver.get("http://localhost:8000/login")

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "email")))
        email_input = driver.find_element(By.ID, "email")
        password_input = driver.find_element(By.ID, "password")

        # ✅ Trường hợp 1: Cả hai đều trống
        email_input.clear()
        password_input.clear()
        password_input.send_keys(Keys.ENTER)

        # Trình duyệt sẽ focus vào trường email nếu nó thiếu
        active = driver.switch_to.active_element
        assert active.get_attribute("id") == "email"
        print("✅ Test empty both fields: PASSED")

        # ✅ Trường hợp 2: Email có, password trống
        email_input.send_keys("alex@alex.com")
        password_input.clear()
        password_input.send_keys(Keys.ENTER)

        active = driver.switch_to.active_element
        assert active.get_attribute("id") == "password"
        print("✅ Test email filled, password empty: PASSED")

        # ✅ Trường hợp 3: Password có, email trống
        email_input.clear()
        password_input.clear()
        password_input.send_keys("12345678")
        email_input.send_keys(Keys.ENTER)  # Nhấn Enter từ ô email

        active = driver.switch_to.active_element
        assert active.get_attribute("id") == "email"
        print("✅ Test password filled, email empty: PASSED")

    except Exception as e:
        print("❌ Validation Test FAILED:", str(e))
    finally:
        driver.quit()

# ✅ Gọi các hàm test
if __name__ == "__main__":
    test_login_success()
    test_empty_fields_validation()

