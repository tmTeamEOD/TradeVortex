from django.core.mail import send_mail

send_mail(
    "Test Subject",
    "Test message",
    "noreply@yourdomain.com",
    ["fakeprice@naver.com"],
    fail_silently=False,
)