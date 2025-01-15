from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    # CSRF 토큰을 직접 반환합니다.
    csrf_token = request.COOKIES.get('csrftoken')
    return JsonResponse({'csrfToken': csrf_token})
