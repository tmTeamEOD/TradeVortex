from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import time  # 지연을 추가하기 위해 time 모듈을 임포트

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from urllib.request import urlretrieve

import os
import pandas as pd

def newspage():
    options = webdriver.ChromeOptions()
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    options.add_argument("disable-blink-features=AutomationControlled")
    # options.add_argument("--headless")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = webdriver.Chrome(options=options)

    url = "https://www.bigkinds.or.kr/v2/news/recentNews.do"
    driver.get(url)
    driver.maximize_window()

    next_button_sel = "a.page-next.page-link"
    result_list = []

    for i in range(1):
        print(f"페이지 : {i + 1}")

        title_sel = "strong.title"
        newsTitles = driver.find_elements(By.CSS_SELECTOR, title_sel)

        driver.execute_script("""
        document.querySelectorAll('div.news-status, .ai-link-right-wrap.logout, button.setup_bt, button.btn-top.active, #header, #footer').forEach(element => {
            element.remove();
        });
        """)
        time.sleep(1)

        for n, news in enumerate(newsTitles, start=1):

            news.click()
            time.sleep(5)

            title_sel = "h1.title"
            body_sel = "div.news-view-body"
            image_sel = "#newsImage"

            try:

                title = driver.find_element(By.CSS_SELECTOR, title_sel).text
                content = driver.find_element(By.CSS_SELECTOR, body_sel).text

                try:
                    image = driver.find_element(By.CSS_SELECTOR, image_sel).get_attribute("src")
                except:
                    image = ""

                result_list.append([title, content, image])

            except:
                pass

            driver.switch_to.active_element.find_element(By.CSS_SELECTOR, "button.modal-close").click()
            time.sleep(1)

        driver.switch_to.default_content()
        driver.find_element(By.CSS_SELECTOR, next_button_sel).click()
        time.sleep(4)

    print(result_list)
