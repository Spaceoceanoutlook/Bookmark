from datetime import datetime
import pytz

# Устанавливаем местное время
local_tz = pytz.timezone("Asia/Yekaterinburg")
utc_now = datetime.now(pytz.utc)
local_time = utc_now.astimezone(local_tz)
