from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from authentication.views import SignUpView, MyTokenObtainPairView, UserProfile, check_email, PasswordResetView, PasswordResetConfirmView, ChangePasswordView
from projects.views import ProjectViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/signup/', SignUpView.as_view(), name='signup'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('api/profile/', UserProfile, name='user-profile'), 
    path('api/check-email/', check_email, name='check-email'),
    path('api/password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('api/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)