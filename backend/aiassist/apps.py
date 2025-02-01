from django.apps import AppConfig


class AiassistConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aiassist'

    def ready(self):
        import aiassist.signals  # signals.py를 임포트하여 자동으로 등록
