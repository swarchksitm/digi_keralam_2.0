import multiprocessing

bind = "unix:/run/gunicorn.sock"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 4
timeout = 30
keepalive = 2

accesslog = "-"
errorlog = "-"
capture_output = True
loglevel = "info"

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
