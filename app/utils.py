from datetime import datetime
from functools import lru_cache

import pytz
import time
import random
import re
import bleach

import requests
from bs4 import BeautifulSoup

# Устанавливаем местное время
local_tz = pytz.timezone("Asia/Yekaterinburg")


def get_local_time():
    return datetime.now(local_tz)


# Кэшируем результаты get_title
@lru_cache(maxsize=100)
def get_title(url: str) -> str:
    # Добавляем протокол, если его нет
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    # Список User-Agent для обхода блокировок
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
    ]

    # Заголовки для запроса
    headers = {
        "User-Agent": random.choice(user_agents),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
    }

    try:
        # Выполняем запрос с тайм-аутом
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Проверяем, что запрос успешен
        response.encoding = response.apparent_encoding  # Устанавливаем кодировку

        # Задержка для имитации человеческого поведения
        time.sleep(random.uniform(1, 3))

        # Парсим HTML
        soup = BeautifulSoup(response.text, "html.parser")

        # Проверяем, не попали ли на антибот-страницу
        security_phrases = [
            "Are you not a robot?",
            "Antibot Challenge Page",
            "Вы не робот?",
            "Доступ ограничен",
        ]
        title = soup.title.string if soup.title else url
        if any(phrase in title for phrase in security_phrases):
            return url

        return title

    except requests.exceptions.RequestException:
        return url


def link_search(t: str) -> str:
    # Регулярное выражение для поиска ссылок
    url_pattern = re.compile(r"https?://\S+|www\.\S+|\b\S+\.\S{2,}\b")

    def replace_link(match):
        url = match.group(0)
        return f"<a href='{url}' target='_blank' rel='noopener noreferrer'>{get_title(url)}</a>"

    # Обрабатываем текст
    processed_text = url_pattern.sub(replace_link, t)

    # Санитизируем текст, разрешая только теги <a> и атрибуты href, target, rel
    return bleach.clean(
        processed_text, tags=["a"], attributes={"a": ["href", "target", "rel"]}
    )
