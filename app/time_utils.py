from datetime import datetime
import pytz

# Устанавливаем местное время
local_tz = pytz.timezone("Asia/Yekaterinburg")


def get_local_time():
    return datetime.now(pytz.utc)
